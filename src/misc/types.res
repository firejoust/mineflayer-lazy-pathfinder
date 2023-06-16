module Bot = {
    @genType.import(("mineflayer", "Bot"))
    type t = {

    }

    type pathfinder = {
        createPath: unit => unit,
        followPath: unit => unit,
        goto: unit => unit
    }

    let inject: (t, string, pathfinder) => unit = %raw("(object, key, value) => object[key] = value")
}

module Vec3 = {
    @genType.import(("vec3", "Vec3"))
    type t = {
        x: float,
        y: float,
        z: float
    }
}

module Hazard = {
    type t = {
        heuristic: Vec3.t => float
    }
}

module Goal = {
    @genType.as("Goal")
    type t = {
        heuristic: Vec3.t => float,
        complete: Vec3.t => bool
    }
}

module Path = {
    module Options = {
        type boundaries = {
            maxHeight: int,
            maxDepth: int
        }

        type blocks = {
            avoid: array<int>,
            placeable: array<int>,
            breakable: array<int>,

        }

        type skills = {
            canClimb: bool,
            canSwim: bool,
            canDig: bool,
            canScaffold: bool,
            canCollect: bool,
            canUseTools: bool
        }

        @genType.as("PathOptions")
        type t = {
            boundaries: boundaries,
            blocks: blocks,
            skills: skills
        }

        let defaults = {
            boundaries: {
                maxHeight: 5,
                maxDepth: 5,
            },
            blocks: {
                avoid: [],
                placeable: [],
                breakable: []
            },
            skills: {
                canClimb: true,
                canSwim: true,
                canDig: true,
                canScaffold: true,
                canCollect: true,
                canUseTools: true
            }
        }

        let unwrap = (options) => {
            boundaries: switch options["boundaries"] {
                | Some(boundaries) => {
                    maxHeight: switch boundaries["maxHeight"] {
                        | Some(maxHeight) => maxHeight
                        | None => defaults.boundaries.maxHeight
                    },
                    maxDepth: switch boundaries["maxDepth"] {
                        | Some(maxDepth) => maxDepth
                        | None => defaults.boundaries.maxDepth
                    }
                }
                | None => defaults.boundaries
            },
            blocks: switch options["blocks"] {
                | Some(blocks) => {
                    avoid: switch blocks["avoid"] {
                        | Some(avoid) => avoid
                        | None => defaults.blocks.avoid
                    },
                    placeable: switch blocks["placeable"] {
                        | Some(placeable) => placeable
                        | None => defaults.blocks.placeable
                    },
                    breakable: switch blocks["breakable"] {
                        | Some(breakable) => breakable
                        | None => defaults.blocks.breakable
                    }
                }
                | None => defaults.blocks
            },
            skills: switch options["skills"] {
                | Some(skills) => {
                    canClimb: switch skills["canClimb"] {
                        | Some(canClimb) => canClimb
                        | None => defaults.skills.canClimb
                    },
                    canSwim: switch skills["canSwim"] {
                        | Some(canSwim) => canSwim
                        | None => defaults.skills.canSwim
                    },
                    canDig: switch skills["canDig"] {
                        | Some(canDig) => canDig
                        | None => defaults.skills.canDig
                    },
                    canScaffold: switch skills["canScaffold"] {
                        | Some(canScaffold) => canScaffold
                        | None => defaults.skills.canScaffold
                    },
                    canCollect: switch skills["canCollect"] {
                        | Some(canCollect) => canCollect
                        | None => defaults.skills.canCollect
                    },
                    canUseTools: switch skills["canUseTools"] {
                        | Some(canUseTools) => canUseTools
                        | None => defaults.skills.canUseTools
                    }
                }
                | None => defaults.skills
            }
        }
    }
}