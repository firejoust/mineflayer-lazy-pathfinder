module.exports = function Goals() {
    function Radius3D(destination, radius) {
        destination = destination.floored()
        radius = radius || 0

        this.heuristic = (position) => {
            return position.distanceTo(destination)
        }

        this.complete = (position) => {
            return position.distanceTo(destination) <= radius
        }
    }

    function Radius2D(x, z, radius) {
        x = Math.floor(x)
        z = Math.floor(z)
        radius = radius || 0

        this.heuristic = (position) => {
            const x0 = x - position.x
            const z0 = z - position.z
            return Math.sqrt(x0 ** 2 + z0 ** 2)
        }

        this.complete = (position) => {
            const x0 = x - position.x
            const z0 = z - position.z
            return Math.sqrt(x0 ** 2 + z0 ** 2) <= radius
        }
    }

    function Direction(bot, distance) {
        const currentPos = bot.entity.position.floored()
        distance = distance || 500

        this.heuristic = (position) => {
            const x0 = -Math.sin(bot.entity.yaw) * distance - (position.x - currentPos.x)
            const z0 = -Math.cos(bot.entity.yaw) * distance - (position.z - currentPos.z)
            return Math.sqrt(x0 ** 2 + z0 ** 2)
        }

        this.complete = (_) => {
            return false
        }
    }

    return {
        Radius3D,
        Radius2D,
        Direction
    }
}