import type { TRawPaper } from '../../db/db';

export type TPaper = ReturnType<typeof paperSerializer>

export function paperSerializer(content: TRawPaper, groupId: string) {
    return {
        id: content.id,
        title: content.title,
        keywords: content.keywords,
        abstract: content.abstract,
        groupId,
        status: content.status,
        downloadCount: content.downloadCount,
        isFeatured: content.isFeatured,
        canDownload: content.canDownload,
        rate: content.rate,
        createdAt: content.createdAt,
    };
}

export function paperFileSerializer(paper: TRawPaper) {
    return {
        S3FileId: paper.S3FileId,
    };
}
