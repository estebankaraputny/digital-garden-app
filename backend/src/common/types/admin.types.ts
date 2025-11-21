// En src/common/types/admin.type.ts
import { User as UserModel } from '@prisma/client';

export type User = UserModel;

export enum Role {
  ADMIN = 'ADMIN'
}