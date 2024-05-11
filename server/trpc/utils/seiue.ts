/**
 * @credits https://github.com/linolabs/candlelit/blob/main/types/seiue.ts
 */
import { ofetch } from 'ofetch';
import { env } from '~/server/env';

export function cookiesParser(cookies: string[]) {
  const parsedCookies: Record<string, string> = {};
  for (const cookie of cookies) {
    const [content, ..._options] = cookie.split(';');
    const [name, value] = content.split('=');
    parsedCookies[name] = value;
  }
  return parsedCookies;
}

export interface TCredentials { schoolId: string; password: string };
export interface TDirectCredentials { accessToken: string; activeReflectionId: number }
export interface TSeiueAuthResponse {
  token_type: 'bearer';
  expires_in: number;
  access_token: string;
  active_reflection_id: number;
};

export class Seiue {
  private accessToken: string;
  private activeReflectionId: number;

  constructor(accessToken: string, activeReflectionId: number) {
    this.accessToken = accessToken;
    this.activeReflectionId = activeReflectionId;
  }

  static async init(credentials: TCredentials): Promise<Seiue | null>;
  static async init(credentials: TDirectCredentials, direct: true): Promise<Seiue>;
  static async init(credentials: TCredentials | TDirectCredentials, direct?: true): Promise<Seiue | null> {
    if (direct) {
      const { accessToken, activeReflectionId } = credentials as TDirectCredentials;
      return new Seiue(accessToken, activeReflectionId);
    }
    try {
      const { schoolId, password } = credentials as TCredentials;
      const loginRes = await ofetch.raw(`${env.SEIUE_PASSPORT_URL}/login?school_id=282`, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'origin': env.SEIUE_PASSPORT_URL,
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
          'Referer': `${env.SEIUE_PASSPORT_URL}/login?school_id=282`,
        },
        redirect: 'manual',
        body: new URLSearchParams({ email: schoolId, password, school_id: '282', submit: '提交' }),
      });
      const cookies = cookiesParser(loginRes.headers.getSetCookie());
      const authorizeRes = await ofetch<TSeiueAuthResponse>(`${env.SEIUE_PASSPORT_URL}/authorize`, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'origin': env.SEIUE_CHALK_URL,
          'referer': env.SEIUE_CHALK_URL,
          'cookie': Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join('; '),
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
        },
        body: new URLSearchParams({ client_id: 'GpxvnjhVKt56qTmnPWH1sA', response_type: 'token' }),
      });
      return new Seiue(authorizeRes.access_token, authorizeRes.active_reflection_id);
    } catch {
      return null;
    }
  }

  user() {
    return { accessToken: this.accessToken, activeReflectionId: this.activeReflectionId };
  }

  static async checkTokenStatus(accessToken: string) {
    try {
      await ofetch(`${env.SEIUE_API_URL}/chalk/oauth/info`, {
        method: 'HEAD',
        headers: {
          'accept': ' application/json, text/plain, */*',
          'accept-language': ' zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'authorization': `Bearer ${accessToken}`,
          'origin': 'https://chalk-c3.seiue.com',
          'referer': 'https://chalk-c3.seiue.com/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
