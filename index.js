const Hazards = require("./src/hazards.js")
const Goals = require("./src/goals.js")
const Path = require("./src/path.js")

module.exports.goals = Goals()

module.exports.plugin = function inject(bot) {
    bot.pathfinder = new Plugin(bot)
}

function Plugin(bot) {
    this.Path = Path.inject(bot)
    this.hazards = Hazards.inject(bot)
}