@genType
let plugin = (bot: Types.Bot.t) => {
    Types.Bot.inject(bot, "pathfinder", {
        createPath: () => (),
        followPath: () => (),
        goto: () => ()
    })
}

/*
    todo:
    - generate block ID to min/max height map
    - generate scaffold item ID to block ID map
    - generate block ID to drop item ID to scaffold item ID map
    - generate node block type categorizer map (climbable, swimmable, standable?)
*/

module Goals = Goals
module Hazards = Hazards