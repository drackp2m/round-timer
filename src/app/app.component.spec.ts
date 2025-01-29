import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { render } from '@testing-library/angular';

import { AppComponent } from './app.component';

import { LoadInitialDataUseCase } from 'src/app/use-case/load-initial-data.use-case';

describe('AppComponent', () => {
	const setup = async () => {
		return render(AppComponent, {
			providers: [provideExperimentalZonelessChangeDetection()],
			componentProviders: [
				{
					provide: LoadInitialDataUseCase,
					useValue: {
						execute: () => signal(false),
					},
				},
			],
		});
	};

	it(`should have the 'round-timer' title in the component`, async () => {
		const { fixture } = await setup();
		expect(fixture.componentInstance.title).toBe('round-timer');
	});

	it('should render router-outlet', async () => {
		const { container } = await setup();
		expect(container.querySelector('router-outlet')).toBeTruthy();
	});
});
