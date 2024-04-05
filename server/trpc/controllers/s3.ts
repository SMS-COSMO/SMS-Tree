import { GetObjectCommand, PutObjectCommand, S3, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../env';

export class S3Controller {
  private s3: S3;
  constructor() {
    this.s3 = new S3({
      endpoint: env.S3_SERVER_URL,
      region: 'global',
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * ## **INTERNAL USE ONLY**
   *
   * Generates a presigned URL for standard upload to S3.
   * @param key - The key of the object in S3.
   * @returns A Promise that resolves to the presigned URL.
   */
  async getStandardUploadPresignedUrl(key: string) {
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: key,
      });
      return await getSignedUrl(this.s3, putObjectCommand);
    } catch {
      return false;
    }
  }

  /**
   * ## **INTERNAL USE ONLY**
   *
   * Retrieves the signed URL for a file with the given key.
   * @param key - The key of the file.
   * @returns The signed URL if successful, otherwise false.
   */
  async getFileUrl(key: string) {
    try {
      return await getSignedUrl(this.s3, new GetObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: key,
      }));
    } catch {
      return false;
    }
  }

  /**
   * ## **INTERNAL USE ONLY**
   *
   * Retrieves pre-signed URLs for uploading file parts in a multipart upload.
   * @param key - The key of the object in the S3 bucket.
   * @param filePartTotal - The total number of file parts to upload.
   * @returns An object containing the upload Id and an array of pre-signed URLs for each file part.
   * @throws An error if creating the upload task fails.
   */
  async getMultipartUploadPresignedUrl(key: string, filePartTotal: number) {
    try {
      const uploadId = (
        await this.s3.createMultipartUpload({
          Bucket: env.BUCKET_NAME,
          Key: key,
        })
      ).UploadId;

      if (!uploadId)
        return false;

      const urls: Promise<{ url: string; partNumber: number }>[] = [];

      for (let i = 1; i <= filePartTotal; i++) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: env.BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: i,
        });

        const url = getSignedUrl(this.s3, uploadPartCommand).then(url => ({
          url,
          partNumber: i,
        }));

        urls.push(url);
      }
      return {
        uploadId,
        urls: await Promise.all(urls),
      };
    } catch {
      return false;
    }
  }

  /**
   * ## **INTERNAL USE ONLY**
   *
   * Completes a multipart upload by providing the key, upload Id, and parts.
   * @param key - The key of the object in the S3 bucket.
   * @param uploadId - The Id of the multipart upload.
   * @param parts - An array of parts containing the ETag and part number.
   * @returns A Promise that resolves to the response data from S3.
   */
  async completeMultipartUpload(key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
    try {
      const data = await this.s3.completeMultipartUpload({
        Bucket: env.BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      });
      return data;
    } catch {
      return false;
    }
  }

  async deleteFile(key: string) {
    try {
      await this.s3.deleteObject({
        Bucket: env.BUCKET_NAME,
        Key: key,
      });
      return true;
    } catch {
      return false;
    }
  }
}
