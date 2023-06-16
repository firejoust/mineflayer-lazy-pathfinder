/* TypeScript file generated from types.res by genType. */
/* eslint-disable import/first */


import type {Bot as $$Bot_t} from 'mineflayer';

import type {Vec3 as $$Vec3_t} from 'vec3';

// tslint:disable-next-line:interface-over-type-literal
export type Bot_t = $$Bot_t;

// tslint:disable-next-line:interface-over-type-literal
export type Vec3_t = $$Vec3_t;

// tslint:disable-next-line:interface-over-type-literal
export type Goal_t = { readonly heuristic: (_1:Vec3_t) => number; readonly complete: (_1:Vec3_t) => boolean };
export type Goal = Goal_t;

// tslint:disable-next-line:interface-over-type-literal
export type Path_Options_boundaries = { readonly maxHeight: number; readonly maxDepth: number };

// tslint:disable-next-line:interface-over-type-literal
export type Path_Options_blocks = {
  readonly avoid: number[]; 
  readonly placeable: number[]; 
  readonly breakable: number[]
};

// tslint:disable-next-line:interface-over-type-literal
export type Path_Options_skills = {
  readonly canClimb: boolean; 
  readonly canSwim: boolean; 
  readonly canDig: boolean; 
  readonly canScaffold: boolean; 
  readonly canCollect: boolean; 
  readonly canUseTools: boolean
};

// tslint:disable-next-line:interface-over-type-literal
export type Path_Options_t = {
  readonly boundaries: Path_Options_boundaries; 
  readonly blocks: Path_Options_blocks; 
  readonly skills: Path_Options_skills
};
export type PathOptions = Path_Options_t;
