import type { TUserListOutputItem } from '~/types';

export async function useUserProjectName(user: TUserListOutputItem) {
  const { $api } = useNuxtApp();

  const req = [];
  for (const g of user.groupIds)
    req.push($api.group.content.query({ id: g }));
  const l = await Promise.all(req);

  let str = '';
  if (l.length) {
    str = l[0].projectName ? `《${l[0].projectName}》` : '';
    for (let i = 1; i < l.length; i++) {
      if (l[i].projectName)
        str += `《${l[i].projectName}》`;
    }
  }

  return {
    ...user,
    projectName: str,
  };
}
