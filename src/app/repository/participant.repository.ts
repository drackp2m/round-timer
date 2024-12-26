import { Injectable } from '@angular/core';

import { ParticipantSchema } from '../definition/participant/participant.schema';

import { GenericRepository } from './generic.repository';

@Injectable({
	providedIn: 'root',
})
export class ParticipantRepository extends GenericRepository<ParticipantSchema> {}
