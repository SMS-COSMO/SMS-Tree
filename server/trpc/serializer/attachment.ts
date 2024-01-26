import type { TRawAttachment } from '~/server/db/db';

export function attachmentSerializer(content: TRawAttachment, canDownload: boolean) {
  const { S3FileId, ...noFileContent } = content;
  return {
    ...noFileContent,
    S3FileId: canDownload ? S3FileId : undefined,
  };
}
