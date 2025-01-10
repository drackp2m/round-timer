import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';

import { Theme } from '@app/definition/theme.type';
import { Setting } from '@app/model/setting.model';
import { SettingRepository } from '@app/repository/setting.repository';

@Injectable({
	providedIn: 'root',
})
export class ThemeService implements OnDestroy {
	private readonly settingRepository = inject(SettingRepository);

	private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	private updateTheme?: (e: MediaQueryListEvent | MediaQueryList) => void;
	private readonly theme = signal<Theme | 'system'>('system');
	private readonly prefersColorScheme = signal<Theme>(
		window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
	);

	readonly selectedTheme = computed(() => this.theme());
	readonly activeTheme = computed(() => {
		const theme = this.theme();
		const prefersColorScheme = this.prefersColorScheme();

		const selectedTheme = 'system' === theme ? prefersColorScheme : theme;

		return selectedTheme;
	});

	constructor() {
		this.addMediaQueryEventListener();

		this.setThemeFromSettings();
	}

	ngOnDestroy(): void {
		if (this.updateTheme !== undefined) {
			this.mediaQuery.removeEventListener('change', this.updateTheme);
		}
	}

	async updateSelectedTheme(theme: Theme | 'system', saveSetting = true): Promise<void> {
		this.theme.set(theme);

		if ('system' !== theme) {
			document.documentElement.setAttribute('data-theme', theme);
		} else {
			document.documentElement.setAttribute('data-theme', this.prefersColorScheme());
		}

		if (saveSetting) {
			const currentSetting = await this.settingRepository.findByIndex('setting', 'type', 'THEME');

			if (currentSetting !== undefined) {
				Object.assign(currentSetting, { payload: theme });

				await this.settingRepository.insert('setting', currentSetting);
			} else {
				const setting = new Setting({ type: 'THEME', payload: theme });

				await this.settingRepository.insert('setting', setting);
			}
		}
	}

	private addMediaQueryEventListener(): void {
		this.updateTheme = ({ matches }: MediaQueryListEvent | MediaQueryList) => {
			const theme = matches ? 'dark' : 'light';

			this.prefersColorScheme.set(theme);

			if ('system' === this.theme()) {
				document.documentElement.setAttribute('data-theme', theme);
			}
		};

		this.mediaQuery.addEventListener('change', this.updateTheme);
	}

	private setThemeFromSettings(): void {
		void this.settingRepository.findByIndex('setting', 'type', 'THEME').then((setting) => {
			if (setting !== undefined) {
				void this.updateSelectedTheme(setting.payload as Theme, false);
			} else {
				void this.updateSelectedTheme('system');
			}
		});
	}
}
