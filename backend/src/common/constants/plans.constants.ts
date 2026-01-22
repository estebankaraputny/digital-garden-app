
export enum Plan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  UNLIMITED = 'UNLIMITED',
}

export const PLAN_LIMITS = {
  [Plan.FREE]: 5,
  [Plan.BASIC]: 15,
  [Plan.PREMIUM]: 1000,
  [Plan.UNLIMITED]: Infinity,
};