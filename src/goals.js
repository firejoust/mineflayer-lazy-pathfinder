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

    function Avoid(position, distance) {
        distance = distance || 200

        this.heuristic = (_position) => {
            return -currentPos.distanceTo(_position)
        }

        this.complete = (_position) => {
            position.distanceTo(_position) > distance
        }
    }

    return {
        Radius3D,
        Radius2D,
        Avoid
    }
}