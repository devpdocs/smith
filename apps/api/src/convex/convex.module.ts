import { Module } from '@nestjs/common';
import { ConvexService } from './convex.service';

@Module({
  providers: [ConvexService],
  exports: [ConvexService],
})
export class ConvexModule {}
