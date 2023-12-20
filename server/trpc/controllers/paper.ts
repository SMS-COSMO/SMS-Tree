import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { TNewPaper, TRawUser } from '../../db/db';

import { papers } from '../../db/schema/paper';
import type { TPaper } from '../serializer/paper';
import { paperFileSerializer, paperSerializer } from '../serializer/paper';
import { papersToGroups } from '../../db/schema/paperToGroup';

export class PaperController {
    async create(newPaper: TNewPaper & { groupId?: string }) {
        const { title, keywords, abstract, canDownload, S3FileId, groupId } = newPaper;
        const paper = { title, keywords, abstract, canDownload, S3FileId };

        try {
            const insertedId = (await db.insert(papers).values(paper).returning({ id: papers.id }))[0].id;
            if (groupId)
                await db.insert(papersToGroups).values({ groupId, paperId: insertedId });
            return { success: true, message: '创建成功' };
        }
        catch (err) {
            return { success: false, message: '服务器内部错误' };
        }
    }

    async remove(id: string) {
        try {
            await db.delete(papersToGroups).where(eq(papersToGroups.paperId, id));
            await db.delete(papers).where(eq(papers.id, id));
            return { success: true, message: '删除成功' };
        }
        catch (err) {
            return { success: false, message: '论文不存在' };
        }
    }

    async getContent(id: string) {
        try {
            const info = (await db.select().from(papers).where(eq(papers.id, id)))[0];
            const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, id));
            const paper = paperSerializer(info, groups.length ? groups[0].groupId : '');
            return { success: true, res: paper, message: '查询成功' };
        }
        catch (err) {
            return { success: false, message: '论文不存在' };
        }
    }

    async getFile(id: string, role: TRawUser['role']) {
        try {
            const paper = (await db.select().from(papers).where(eq(papers.id, id)))[0];
            if (!paper.canDownload && role === 'student')
                return { success: false, message: '无下载权限' };

            const file = paperFileSerializer(paper);
            await db.update(papers).set({ downloadCount: paper.downloadCount + 1 }).where(eq(papers.id, id));
            return { success: true, res: file, message: '查询成功' };
        }
        catch (err) {
            return { success: false, message: '论文不存在' };
        }
    }

    async getList() {
        try {
            const res: Array<TPaper> = [];
            for (const paper of await db.select().from(papers)) {
                const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, paper.id));
                res.push(paperSerializer(paper, groups.length ? groups[0].groupId : ''));
            }

            return { success: true, res, message: '查询成功' };
        }
        catch (err) {
            return { success: false, message: '服务器内部错误' };
        }
    }
}
