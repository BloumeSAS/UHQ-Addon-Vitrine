import { Body, Controller, Get, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PanelAuthService } from '../auth/panel-auth.service';
import { StoreService, sanitizeConfig } from './store.service';
import { VitrineService } from './vitrine.service';

@Controller('api')
export class VitrineController {
  constructor(
    private readonly vitrine: VitrineService,
    private readonly store: StoreService,
    private readonly auth: PanelAuthService,
  ) {}

  /** GET /api/public — données de la vitrine (PUBLIQUES : aucun jeton requis, aucune donnée sensible). */
  @Get('public')
  async publicData(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'public, max-age=20');
    return this.vitrine.publicData();
  }

  /** GET /api/logo — logo du panel (chemin relatif) relayé pour l'iframe embarquée. */
  @Get('logo')
  async logo(@Res() res: Response) {
    const logo = await this.vitrine.logo();
    if (!logo) {
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', logo.type);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.end(logo.body);
  }

  /** GET /api/config — configuration éditable (ADMIN, jeton vérifié par le panel). */
  @Get('config')
  async getConfig(@Req() req: Request) {
    await this.auth.requireAdmin(req);
    return { config: this.store.config, categories: await this.vitrine.categoryKeys() };
  }

  /** PUT /api/config — enregistre la configuration (ADMIN). */
  @Put('config')
  async putConfig(@Req() req: Request, @Body() body: { config?: unknown }) {
    await this.auth.requireAdmin(req);
    this.store.save(sanitizeConfig(body?.config));
    return { config: this.store.config };
  }
}
