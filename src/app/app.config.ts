import { ApplicationConfig, inject, isDevMode, provideAppInitializer } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TitleStrategy, provideRouter, withHashLocation, withRouterConfig } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { APP_ROUTES } from './app.routes';
import { TemplatePageTitleStrategy } from './strategy/template-file-title.strategy';

import { GameRepository } from '@app/repository/game.repository';
import { MatchRepository } from '@app/repository/match.repository';
import { PlayerRepository } from '@app/repository/player.repository';
import { SettingRepository } from '@app/repository/setting.repository';
import { ThemeService } from '@app/service/theme.service';

export const appConfig: ApplicationConfig = {
	providers: [
		GameRepository,
		MatchRepository,
		PlayerRepository,
		SettingRepository,
		provideAnimations(),
		provideAppInitializer(() => {
			const _themeService = inject(ThemeService);
		}),
		provideRouter(
			APP_ROUTES,
			withHashLocation(),
			withRouterConfig({
				paramsInheritanceStrategy: 'always',
				onSameUrlNavigation: 'reload',
			}),
		),
		{ provide: TitleStrategy, useClass: TemplatePageTitleStrategy },
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			scope: '/',
			registrationStrategy: 'registerWhenStable:2000',
		}),
	],
};
