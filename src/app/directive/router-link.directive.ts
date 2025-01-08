import { Directive, OnInit, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterLinkWithHref } from '@angular/router';

@Directive({
	selector: '[appRouterLink]',
	standalone: true,
	hostDirectives: [
		RouterLink,
		{
			directive: RouterLinkActive,
		},
	],
})
export class RouterLinkDirective implements OnInit {
	appRouterLink = input<string>();
	routerLinkActive = input('active');
	routerLinkActiveOptions = input({ exact: true });

	private routerLink = inject(RouterLink, { optional: true });
	private routerLinkWithHref = inject(RouterLinkWithHref, { optional: true });
	private routerLinkActiveDirective = inject(RouterLinkActive);

	ngOnInit(): void {
		const link = this.appRouterLink();

		if (null !== this.routerLink) {
			this.routerLink.routerLink = link;
		}

		if (null !== this.routerLinkWithHref) {
			this.routerLinkWithHref.routerLink = link;
		}

		console.log({
			appRouterLink: this.appRouterLink(),
			routerLinkActive: this.routerLinkActive(),
			routerLinkActiveOptions: this.routerLinkActiveOptions(),
		});

		this.routerLinkActiveDirective.routerLinkActive = this.routerLinkActive();
		this.routerLinkActiveDirective.routerLinkActiveOptions = this.routerLinkActiveOptions();
	}
}
