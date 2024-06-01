/**
 * @credits https://github.com/linolabs/candlelit
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
  private fetcher: typeof ofetch;

  constructor({ accessToken, activeReflectionId }: TDirectCredentials) {
    this.accessToken = accessToken;
    this.activeReflectionId = activeReflectionId;
    this.fetcher = ofetch.create({
      headers: {
        'authorization': `Bearer ${this.accessToken}`,
        'x-reflection-id': this.activeReflectionId.toString(),
        'x-school-id': '282',
        'referer': env.SEIUE_CHALK_URL,
      },
      retry: 2,
      retryDelay: 50,
    });
  }

  static async init(credentials: TCredentials): Promise<Seiue> {
    const loginRes = await this.login(credentials);
    if (!loginRes)
      throw new Error('登录失败');
    return new Seiue({
      accessToken: loginRes.accessToken,
      activeReflectionId: loginRes.activeReflectionId,
    });
  }

  static async login(credentials: TCredentials) {
    try {
      const { schoolId, password } = credentials;
      const loginRes = await ofetch.raw(`${env.SEIUE_PASSPORT_URL}/login?school_id=282`, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        redirect: 'manual',
        body: new URLSearchParams({ email: schoolId, password, school_id: '282', submit: '提交' }),
      });
      const cookies = cookiesParser(loginRes.headers.getSetCookie());
      const authorizeRes = await this.retrieveToken(cookies);
      return {
        accessToken: authorizeRes.access_token,
        activeReflectionId: authorizeRes.active_reflection_id,
        cookies,
      };
    } catch {
      return null;
    }
  }

  user() {
    return { accessToken: this.accessToken, activeReflectionId: this.activeReflectionId };
  }

  static async retrieveToken(cookies: Record<string, string>) {
    return ofetch<TSeiueAuthResponse>(`${env.SEIUE_PASSPORT_URL}/authorize`, {
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
  }

  static async checkTokenStatus(accessToken: string) {
    try {
      await ofetch(`${env.SEIUE_API_URL}/chalk/oauth/info`, {
        method: 'HEAD',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
