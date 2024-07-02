export interface TCredentials { schoolId: string; password: string };
export interface TDirectCredentials { accessToken: string; activeReflectionId: number }
export interface TSeiueAuthResponse {
  token_type: 'bearer';
  expires_in: number;
  access_token: string;
  active_reflection_id: number;
};

// https://open.seiue.com/docs/api-users.html
export interface TSeiueUser {
  id?: number; // seiue internal id
  name: string; // name
  usin?: string; // school id
  pinyin: string;
  role: 'teacher' | 'guardian' | 'staff' | 'student' | 'shadow';
  phone?: string;
  status?: 'normal' | 'archived';
  gender?: 'm' | 'f';
  // Not used
  // user_id?: number;
  // ename?: string;
  // email?: string;
  // idcard?: string;
  // photo?: string;
  // archived_type_id?: number;
  // archived_type?: any;
  // outer_id?: string;
  // deleted_at?: string;
}

export interface TSeiueSemester {
  id: number;
  name: string;
  is_current: boolean;
}

export type TSeiueSemesterList = TSeiueSemester[];

export interface TSeiueClass {
  id: number;
  name: string;
  extra_fields: {
    subject_name: string;
  };
}

export type TSeiueClassList = TSeiueClass[];

export interface TSeiueClassMember {
  reflection: {
    id: number;
    admin_classes: string[];
    usin: string;
    name: string;
    grade: {
      id: number;
      name: string;
    };
    graduates_in: {
      id: number;
      name: string;
    };
  };
}

export type TSeiueClassMemberList = TSeiueClassMember[];

export interface TSeiueGeneratedPhoneCode {
  ok: boolean;
  reminder_id: string;
};
