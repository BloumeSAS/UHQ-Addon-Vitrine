import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import * as fs from 'fs';
import { VitrineModule } from './vitrine/vitrine.module';
import { ManifestController } from './manifest/manifest.controller';
import { ThemeController } from './manifest/theme.controller';
import { BackupController } from './backup/backup.controller';

/** Résout le chemin du build React (web/dist) depuis n'importe où. */
function resolveWebDist(): string {
  const candidate = path.join(__dirname, '..', '..', 'web', 'dist');
  if (fs.existsSync(candidate)) return candidate;
  return path.join(process.cwd(), '..', 'web', 'dist');
}

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: resolveWebDist(),
      exclude: ['/api/(.*)'],
      serveStaticOptions: { index: false },
    }),
    VitrineModule,
  ],
  controllers: [ManifestController, ThemeController, BackupController],
})
export class AppModule {}
