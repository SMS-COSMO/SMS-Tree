import type { TRawClass } from '~/server/db/db';

export function useClassGrade(enterYear: number) {
  const now = new Date();
  const year = now.getFullYear() - enterYear + (now.getMonth() > 8 ? 1 : 0);

  return year < 4 ? ['新高一', '高一', '高二', '高三'][year] : `${enterYear}届`;
}

export function useClassName(classInfo: Partial<TRawClass> | undefined | null) {
  if (!classInfo || !classInfo.enterYear)
    return '未知';

  const now = new Date();
  const year = now.getFullYear() - classInfo.enterYear + (now.getMonth() > 8 ? 1 : 0);

  return `${year < 4 ? ['新高一', '高一', '高二', '高三'][year] : `${classInfo.enterYear}届`}（${classInfo.index}）`;
}

export function useClassState(value: string) {
  return classStateTable.find(s => s.value === value) ?? { label: '未知', type: 'info', value: '' };
}
