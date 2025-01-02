import { GameSchema } from '@app/repository/definition/game-schema.interface';
import { MatchSchema } from '@app/repository/definition/match-schema.interface';
import { PlayerSchema } from '@app/repository/definition/player-schema.interface';

export type AppSchemas = PlayerSchema | GameSchema | MatchSchema;
