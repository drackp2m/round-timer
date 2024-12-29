import { Injectable } from '@angular/core';

import { PlayerSchema } from '@app/definition/player/player.schema';

import { GenericRepository } from './generic.repository';

@Injectable({
	providedIn: 'root',
})
export class PlayerRepository extends GenericRepository<PlayerSchema> {}
