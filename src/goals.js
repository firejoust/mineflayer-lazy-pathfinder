module.exports.inject = function inject(Setter) {
    
    const Register = (parent, setters) => {
        for (let key in setters) {
            parent[key] = setters[key]
        }
    }

    function Radius3D(destination) {
        destination = destination.floored()

        let radius = 0
        let timeout = 10
        let blocks  = 10000

        this.radius = Setter(this, _ => radius = _)
        this.timeout = Setter(this, _ => timeout = _)
        this.blocks = Setter(this, _ => blocks = _)

        this.register = (parent) => {
            Register(parent, {
                radius: Setter(parent, this.radius),
                timeout: Setter(parent, this.timeout),
                blocks: Setter(parent, this.blocks),
            })
        }

        this.heuristic = (position) => {
            return position.distanceTo(destination)
        }

        this.continue = (status) => {
            return status.blocks < blocks &&
                   status.timeout < timeout
        }

        this.complete = (position) => {
            return position.distanceTo(destination) <= radius
        }
    }

    function Radius2D(x, z) {
        x = Math.floor(x)
        z = Math.floor(z)
        
        let radius = 0
        let timeout = 10
        let blocks = 10000

        this.radius = Setter(this, _ => radius = _)
        this.timeout = Setter(this, _ => timeout = _)
        this.blocks = Setter(this, _ => blocks = _)

        this.register = (parent) => {
            Register(parent, {
                radius: this.radius,
                timeout: this.timeout,
                blocks: this.blocks,
            })
        }

        this.heuristic = (position) => {
            const x0 = x - position.x
            const z0 = z - position.z
            return Math.sqrt(x0 ** 2 + z0 ** 2)
        }

        this.continue = (status) => {
            return status.blocks < blocks &&
                   status.timeout < timeout
        }

        this.complete = (position) => {
            const x0 = x - position.x
            const z0 = z - position.z
            return Math.sqrt(x0 ** 2 + z0 ** 2) <= radius
        }
    }

    function Direction(bot) {
        const currentPos = bot.entity.position.floored()
        let render = 500
        let timeout = 10
        let blocks = 1000

        this.render = Setter(this, _ => render = _)
        this.timeout = Setter(this, _ => timeout = _)
        this.blocks = Setter(this, _ => blocks = _)

        this.register = (parent) => {
            Register(parent, {
                render: this.render,
                timeout: this.timeout,
                blocks: this.blocks,
            })
        }

        this.heuristic = (position) => {
            const x0 = -Math.sin(bot.entity.yaw)   * render - (position.x - currentPos.x)
            const z0 = -Math.cos(bot.entity.yaw)   * render - (position.z - currentPos.z)
            return Math.sqrt(x0 ** 2 + z0 ** 2)
        }

        this.continue = (status) => {
            return status.blocks < blocks &&
                   status.timeout < timeout
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