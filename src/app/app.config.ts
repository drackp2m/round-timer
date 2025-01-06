import {
	ApplicationConfig,
	isDevMode,
	provideExperimentalCheckNoChangesForDebug,
	provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(APP_ROUTES, withHashLocation()),
		provideAnimations(),
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerWhenStable:5000',
			scope: '/',
		}),
		provideExperimentalZonelessChangeDetection(),
		provideExperimentalCheckNoChangesForDebug({
			exhaustive: true,
			interval: 500,
		}),
	],
};
