import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { StrapiModule } from '../strapi/strapi.module';
import { ConvexModule } from '../convex/convex.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, StrapiModule, ConvexModule, AuthModule, AuditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
