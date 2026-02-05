export interface DecodedAccessToken {
  sub: number;
  email?: string;
  username?: string;
  roles?: string[];
  iat: number;
  exp: number;
}

export interface UserInfo {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles?: string[];
}

export enum IssuerType {
  LOCAL = 'local',
  MOODLE = 'moodle',
}
