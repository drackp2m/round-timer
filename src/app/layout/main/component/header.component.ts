import { Component, inject } from '@angular/core';
import { TitleService } from '@app/service/title.service';

import { ButtonDirective } from '@app/directive/button.directive';
import { RouterLinkDirective } from '@app/directive/router-link.directive';

@Component({
	selector: 'app-header',
	template: `<section
		class="header pb-2 px-4 surface-contrast color-primary flex-row align-center justify-between"
	>
		<button appRouterLink="/" class="flex-row gap-2 align-center logo">
			<img src="favicon.svg" alt="App Logo" />
			<h3>{{ title() }}</h3>
		</button>

		<div class="flex-row gap-2 align-center">
			<button appButton appRouterLink="/match" icon="dice">
				<!---->
			</button>
			<button appButton appRouterLink="/settings" icon="gear">
				<!---->
			</button>
		</div>
	</section>`,
	styles: [
		`
			.header {
				padding-top: calc(var(--spacing-2) + env(safe-area-inset-top, 0));

				.logo {
					height: 24px;
					color: var(--color-primary);
				}

				[appRouterLink]:not(.logo) {
					color: var(--color-primary-mid);

					&.active {
						color: var(--color-primary);
					}
				}
			}
		`,
	],
	imports: [RouterLinkDirective, ButtonDirective],
})
export class HeaderComponent {
	private readonly titleService = inject(TitleService);

	readonly title = this.titleService.title;
}
