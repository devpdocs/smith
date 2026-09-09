import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

/** Global config provider so every module can inject ConfigService. */
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
