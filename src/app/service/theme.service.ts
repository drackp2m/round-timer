import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';

import { Theme } from '@app/definition/theme.type';
import { SettingStore } from '@app/store/setting.store';

@Injectable({
	providedIn: 'root',
})
export class ThemeService implements OnDestroy {
	private readonly settingStore = inject(SettingStore);

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

		const waitForSetting = effect(() => {
			const isLoading = this.settingStore.isLoading();

			if (!isLoading) {
				this.setThemeFromSettings();

				waitForSetting.destroy();
			}
		});
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
			const newSetting = this.settingStore
				.settingEntities()
				.find((setting) => 'THEME' === setting.type)
				?.with({ payload: theme });

			if (undefined !== newSetting) {
				this.settingStore.update(newSetting);
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

	private setThemeFromSettings() {
		const setting = this.settingStore.settingEntities().find((setting) => 'THEME' === setting.type);

		if (setting !== undefined) {
			void this.updateSelectedTheme(setting.payload as Theme, false);
		} else {
			void this.updateSelectedTheme('system');
		}
	}
}
