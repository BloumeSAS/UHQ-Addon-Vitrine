import { Module } from '@nestjs/common';
import { PanelAuthService } from '../auth/panel-auth.service';
import { StoreService } from './store.service';
import { VitrineService } from './vitrine.service';
import { VitrineController } from './vitrine.controller';

@Module({
  providers: [StoreService, PanelAuthService, VitrineService],
  controllers: [VitrineController],
  exports: [StoreService, PanelAuthService],
})
export class VitrineModule {}
