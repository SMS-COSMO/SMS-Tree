import type { TClassContentOutput, TUserProfileOutput } from '~/types/index';

export async function useClassString(userInfo: TUserProfileOutput | undefined) {
  if (!userInfo)
    return '';
  const { $api } = useNuxtApp();
  const classInfo = ref<TClassContentOutput>();
  try {
    classInfo.value = await $api.class.content.query({ id: userInfo.classIds[0] });
  } catch (err) {
    return '未知';
  }
  if (!classInfo.value)
    return '未知';

  const now = new Date();
  const yearString = ['', '高一', '高二', '高三', '毕业'];
  const year = now.getFullYear() - classInfo.value.enterYear + (now.getMonth() > 8 ? 1 : 0);

  return `${yearString[year]}（${classInfo.value.index}）`;
}
