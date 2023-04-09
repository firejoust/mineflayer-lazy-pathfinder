const Path = require("./src/path.js")

const Set = (instance, callback) => {
    return (...args) => {
        callback(...args)
        return instance
    }
}

module.exports.plugin = function inject(bot) {
    bot.pathfinder = new Plugin(bot)
}

function Plugin(bot) {
    this.Path = Path.inject(bot, Set)
}