
export enum Plan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  UNLIMITED = 'UNLIMITED',
}

export const PLAN_LIMITS = {
  [Plan.FREE]: 10,
  [Plan.BASIC]: 200,
  [Plan.PREMIUM]: 1000,
  [Plan.UNLIMITED]: Infinity,
};