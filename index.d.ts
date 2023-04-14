import { Bot } from "mineflayer";
import { Vec3 } from "vec3";
import Prismarine from "prismarine-entity";

type AvoidBlocks = {
    [name: string]: boolean;
};

interface Goal {
    heuristic: (position: Vec3) => number;
    complete: (position: Vec3) => boolean;
}

declare namespace Hazards {
    interface Hazard {
        heuristic: (position: Vec3) => number;
    }

    class Block implements Hazard {
        constructor(weight?: number, offset?: Vec3, avoid?: AvoidBlocks);
        heuristic: (position: Vec3) => number;
        weight: (weight: number) => this;
        offset: (offset: Vec3) => this;
        avoid: (avoid: AvoidBlocks) => this;
    }

    class Entity implements Hazard {
        constructor(weight?: number, radius?: number, entities?: Prismarine.Entity[]);
        heuristic: (position: Vec3) => number;
        weight: (weight: number) => this;
        radius: (radius: number) => this;
        entities: (entities: Prismarine.Entity[]) => this;
    }

    class Position implements Hazard {
        constructor(weight?: number, radius?: number, coordinates?: Vec3[]);
        heuristic: (position: Vec3) => number;
        weight: (weight: number) => this;
        radius: (radius: number) => this;
        coordinates: (coordinates: Vec3[]) => this;
    }
}

declare interface Hazards {
    Block: typeof Hazards.Block;
    Entity: typeof Hazards.Entity;
    Position: typeof Hazards.Position;
}

declare class Path {
    constructor(goal: Goal, ...hazards: Hazards[]);
    avoid: (avoid: AvoidBlocks) => this;
    depth: (depth: number) => this;
    blocks: (blocks: number) => this;
    timeout: (timeout: number) => this;
    execute(): void;
}

interface Pathfinder {
    hazards: Hazards;
    Path: typeof Path;
}

declare function inject(bot: Bot): void;

declare module 'mineflayer' {
    interface Bot {
        pathfinder: Pathfinder;
    }
}

export interface goals {
    Radius3D: (x: number, z: number, radius?: number) => Goal;
    Radius2D: (x: number, z: number, radius?: number) => Goal;
    Direction: (bot: Bot, distance?: number) => Goal;
}

export function plugin(bot: Bot): void;