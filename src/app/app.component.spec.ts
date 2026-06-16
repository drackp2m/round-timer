import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

import { GameRepository } from '@app/repository/game.repository';
import { MatchRepository } from '@app/repository/match.repository';

const mockRepository = {
	findInProgressMatch: vi.fn().mockResolvedValue(undefined),
};

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AppComponent],
			providers: [
				{ provide: MatchRepository, useValue: mockRepository },
				{ provide: GameRepository, useValue: mockRepository },
			],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		expect(fixture.componentInstance).toBeTruthy();
	});

	it(`should have the 'round-timer' title`, () => {
		const fixture = TestBed.createComponent(AppComponent);
		expect(fixture.componentInstance.title).toBe('round-timer');
	});
});
