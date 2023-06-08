import { Bot } from "mineflayer";
import { Vec3 } from "vec3";
import Prismarine from "prismarine-entity";

type AvoidBlocks = {
    [name: string]: boolean;
};

type Hazards = hazards.Block | hazards.Entity | hazards.Position

interface Goal {
    heuristic: (position: Vec3) => number;
    complete: (position: Vec3) => boolean;
}

declare class Hazard {
    heuristic: (position: Vec3) => number;
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
    Path: typeof Path;
    follow: (path: Vec3[]) => Promise<void>
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
    Avoid: (position: Vec3, distance?: number) => Goal;
}

export namespace hazards {
    class Block extends Hazard {
        constructor(bot: Bot, weight?: number, offset?: Vec3, avoid?: AvoidBlocks);
        weight: (weight: number) => this;
        offset: (offset: Vec3) => this;
        avoid: (avoid: AvoidBlocks) => this;
    }
    
    class Entity extends Hazard {
        constructor(weight?: number, radius?: number, entities?: Prismarine.Entity[]);
        weight: (weight: number) => this;
        radius: (radius: number) => this;
        entities: (entities: Prismarine.Entity[]) => this;
    }
    
    class Position extends Hazard {
        constructor(weight?: number, radius?: number, coordinates?: Vec3[]);
        weight: (weight: number) => this;
        radius: (radius: number) => this;
        coordinates: (coordinates: Vec3[]) => this;
    }
}

export function plugin(bot: Bot): void;