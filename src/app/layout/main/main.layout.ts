import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './component/header/header.component';

@Component({
	templateUrl: './main.layout.html',
	styleUrl: './main.layout.scss',
	imports: [RouterOutlet, HeaderComponent],
})
export class MainLayout {}
