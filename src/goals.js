module.exports.inject = function inject(bot, Set) {
    
    const Register = (parent, setters) => {
        for (let key in setters) {
            parent[key] = setters[key]
        }
    }

    function Radius3D(destination) {
        let radius = 5
        let timeout = 50
        let blocks  = 100

        this.radius = Set(this, _ => radius = _)
        this.timeout = Set(this, _ => timeout = _)
        this.blocks = Set(this, _ => blocks = _)

        this.register = (parent) => {
            Register(parent, {
                radius: this.radius,
                timeout: this.timeout,
                blocks: this.blocks,
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