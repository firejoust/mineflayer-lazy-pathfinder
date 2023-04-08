const Path = require("./src/path.js")

module.exports.plugin = function inject(bot) {
    bot.pathfinder = new Plugin(bot)
}

function Plugin(bot) {
    this.Path = Path.inject(bot)
}