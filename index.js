const Path = require("./src/path.js")
const Goals = require("./src/goals.js")

module.exports.goals = Goals()

module.exports.plugin = function inject(bot) {
    bot.pathfinder = new Plugin(bot)
}

function Plugin(bot) {
    this.Path = Path.inject(bot)
}