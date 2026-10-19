import { Body, Controller, Get, Headers, Logger, Post } from '@nestjs/common';
import { PanelAuthService } from '../auth/panel-auth.service';
import { StoreService, sanitizeConfig } from '../vitrine/store.service';

/** Sauvegarde / restauration pour le panel (déclaré dans uhq-manifest.json). Auth : X-Panel-Key (temps constant ; refusé si non configurée). */
@Controller('api/backup')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(private readonly store: StoreService, private readonly auth: PanelAuthService) {}

  @Get('export')
  export(@Headers('x-panel-key') key: string) {
    this.auth.requirePanelKey(key);
    return { config: this.store.config, exportedAt: new Date().toISOString() };
  }

  @Post('import')
  import(@Headers('x-panel-key') key: string, @Body() body: { config?: unknown }) {
    this.auth.requirePanelKey(key);
    this.store.save(sanitizeConfig(body?.config));
    this.logger.log('Backup import: configuration restaurée');
    return { success: true };
  }
}
