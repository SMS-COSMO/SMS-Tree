import type { TRawClass } from '~/server/db/db';

export function classGrade(enterYear: number) {
  const now = new Date();
  const year = now.getFullYear() - enterYear + (now.getMonth() > 8 ? 1 : 0);

  return year < 4 ? ['新高一', '高一', '高二', '高三'][year] : `${enterYear}届`;
}

export function className(classInfo: Partial<TRawClass> | undefined | null) {
  if (!classInfo || !classInfo.enterYear)
    return '未知';

  return `${classGrade(classInfo.enterYear)}（${classInfo.index}）`;
}

export function classStateName(value: string) {
  return classStateTable.find(s => s.value === value) ?? { label: '未知', type: 'info', value: '' };
}
