const Set = (instance, callback) => {
    return (...args) => {
        callback(...args)
        return instance
    }
}
const Register = (parent, setters) => {
    for (let key in setters) {
        parent[key] = setters[key]
    }
}

module.exports.inject = function inject(bot) {
    function Radius3D(destination) {
        let radius = 5
        let timeout = 50
        let blocks  = 100

        this.register = (parent) => {
            Register(parent, {
                radius: Set(this, _ => radius = _),
                timeout: Set(this, _ => timeout = _),
                blocks: Set(this, _ => blocks = _)
            })
        }

        this.heuristic = (currentPos, nextPos) => {
            return currentPos.distanceTo(nextPos)
        }

        this.continue = (status) => {
            return status.blocks < blocks &&
                   status.timeout < timeout
        }

        this.complete = (position) => {
            return position.distanceTo(destination) <= radius
        }
    }
}