module.exports.inject = function inject(bot) {
    return function Path(goal) {
        goal.register(this)
    }
}