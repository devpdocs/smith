import { Module } from '@nestjs/common';
import { StrapiModule } from '../strapi/strapi.module';
import { ConvexModule } from '../convex/convex.module';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { SessionGuard } from '../auth/session.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [StrapiModule, ConvexModule],
  controllers: [AuditController],
  providers: [AuditService, SessionGuard, RolesGuard],
})
export class AuditModule {}
