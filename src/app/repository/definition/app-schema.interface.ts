import { GameSchema } from '@app/repository/definition/game-schema.interface';
import { MatchSchema } from '@app/repository/definition/match-schema.interface';
import { PlayerSchema } from '@app/repository/definition/player-schema.interface';
import { SettingSchema } from '@app/repository/definition/setting-schema.interface';

export type AppSchema = PlayerSchema | GameSchema | MatchSchema | SettingSchema;
