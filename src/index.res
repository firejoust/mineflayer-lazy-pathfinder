let plugin = (bot: Types.Bot.t) => {
    Types.Bot.inject(bot, "pathfinder", {
        createPath: () => (),
        followPath: () => (),
        goto: () => ()
    })
}