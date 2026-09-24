import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type AppRole =
  | 'SUPER_ADMIN'
  | 'MANAGER'
  | 'KITCHEN_STAFF'
  | 'DELIVERY_STAFF'
  | 'ACCOUNTANT';

export const Roles = (...roles: AppRole[]) =>
  SetMetadata(ROLES_KEY, roles);
