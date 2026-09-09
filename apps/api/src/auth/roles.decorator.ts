import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@mvp/contracts';
import { ROLES_KEY } from './roles.guard';

/** Declares the end-user roles allowed to access a route (Q3; Q4). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/** Convenience decorator restricting a route to the admin end-user role (Q4). */
export const Admin = () => Roles('admin');
