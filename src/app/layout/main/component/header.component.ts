import { Component, inject } from '@angular/core';

import { ButtonDirective } from '@app/directive/button.directive';
import { RouterLinkDirective } from '@app/directive/router-link.directive';
import { TitleService } from '@app/service/title.service';

@Component({
	selector: 'app-header',
	template: `<section
		class="header force-light pb-2 px-4 surface-contrast color-primary flex-row align-center justify-between"
	>
		<button appRouterLink="/" class="flex-row gap-2 align-center logo">
			<img src="icon-solo-dark.svg" alt="App Logo" />
			<h3>{{ title() }}</h3>
		</button>

		<div class="flex-row gap-2 align-center">
			<button appButton type="button" appRouterLink="/match" icon="dice">
				<!---->
			</button>
			<button appButton type="button" appRouterLink="/settings" icon="gear">
				<!---->
			</button>
		</div>
	</section>`,
	styles: [
		`
			.header {
				padding-top: calc(var(--spacing-2) + env(safe-area-inset-top, 0));
				border-bottom: solid 1.5px var(--color-primary);

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
