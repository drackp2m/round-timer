import {
	ApplicationConfig,
	isDevMode,
	provideExperimentalCheckNoChangesForDebug,
	provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TitleStrategy, provideRouter, withHashLocation, withRouterConfig } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { APP_ROUTES } from './app.routes';

import { TemplatePageTitleStrategy } from 'src/app/strategy/template-file-title.strategy';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(
			APP_ROUTES,
			withHashLocation(),
			withRouterConfig({
				paramsInheritanceStrategy: 'always',
				onSameUrlNavigation: 'reload',
				// routerLinkActiveOptions: {
				// 	exact: true
				// }
			}),
		),
		{ provide: TitleStrategy, useClass: TemplatePageTitleStrategy },
		provideAnimations(),
		provideExperimentalZonelessChangeDetection(),
		provideExperimentalCheckNoChangesForDebug({
			interval: 50,
			exhaustive: true,
		}),
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			scope: '/',
			registrationStrategy: 'registerWhenStable:2000',
		}),
	],
};
