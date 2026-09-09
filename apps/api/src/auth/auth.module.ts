import { Module } from '@nestjs/common';
import { StrapiModule } from '../strapi/strapi.module';
import { AuthController } from './auth.controller';
import { SessionGuard } from './session.guard';
import { RolesGuard } from './roles.guard';

/** Bundles the session-identity surface (D2) and its guards. */
@Module({
  imports: [StrapiModule],
  controllers: [AuthController],
  providers: [SessionGuard, RolesGuard],
  exports: [SessionGuard, RolesGuard],
})
export class AuthModule {}
