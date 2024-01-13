import type { TClassContentOutput, TUserProfileOutput } from '~/types/index';

export function useClassString(classInfo: TClassContentOutput) {
  if (!classInfo)
    return '未知';
  const now = new Date();
  const yearString = ['新高一', '高一', '高二', '高三', '毕业'];
  const year = now.getFullYear() - classInfo.enterYear + (now.getMonth() > 8 ? 1 : 0);

  return `${yearString[year]}（${classInfo.index}）`;
}

export async function useUserClassString(userInfo: TUserProfileOutput | undefined) {
  if (!userInfo)
    return '';
  const { $api } = useNuxtApp();
  const classInfo = ref<TClassContentOutput>();
  try {
    classInfo.value = await $api.class.content.query({ id: userInfo.classIds[0] });
  } catch (err) {
    return '未知';
  }

  return useClassString(classInfo.value);
}
