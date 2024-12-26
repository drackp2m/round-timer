import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ModalOutletComponent } from '../../component/modal-outlet.component';

import { HeaderComponent } from './component/header.component';

@Component({
	templateUrl: './main.layout.html',
	styleUrl: './main.layout.scss',
	imports: [HeaderComponent, RouterOutlet, ModalOutletComponent],
})
export class MainLayout {}
