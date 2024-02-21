import type { TClassContent, TUserProfile } from '~/types/index';

export function useClassString(classInfo: TClassContent) {
  if (!classInfo)
    return '未知';
  const now = new Date();
  const yearString = ['新高一', '高一', '高二', '高三', '毕业'];
  const year = now.getFullYear() - classInfo.enterYear + (now.getMonth() > 8 ? 1 : 0);

  return `${yearString[year]}（${classInfo.index}）`;
}

export async function useUserClassString(classId: string) {
  if (!classId)
    return '';

  const { $api } = useNuxtApp();
  const classInfo = ref<TClassContent>();
  try {
    classInfo.value = await $api.class.content.query({ id: classId });
  } catch (err) {
    return '未知';
  }

  return useClassString(classInfo.value);
}
