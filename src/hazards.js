const Vec3 = require("vec3")

const Setter = (instance, callback) => {
    return (...args) => {
        callback(...args)
        return instance
    }
}

module.exports.inject = function Hazards(bot) {
    function Block(weight, avoid, offset) {
        weight = weight || 1
        avoid = avoid || {}
        offset = offset || new Vec3(0, -1, 0)
        
        this.weight = Setter(this, _ => weight = _)
        this.avoid = Setter(this, _ => avoid = _)
        this.offset = Setter(this, (x, y, z) => offset.set(x, y, z))

        this.heuristic = (position) => {
            const block = bot.blockAt(position.plus(offset))
            if (block === null) {
                return 0
            } else 
            
            if (avoid[block.name]) {
                return weight
            } else

            return 0
        }
    }

    function Entity(weight, radius, entities) {
        weight = weight || 1
        radius = radius || 5
        entities = entities || new Array()

        this.weight = Setter(this, _ => weight = _)
        this.radius = Setter(this, _ => radius = _)
        this.entities = Setter(this, _ => entities = _)

        this.heuristic = (position) => {
            for (let entity of entities) {
                if (entity === null) {
                    continue
                } else

                if (position.distanceTo(entity.position) < radius) {
                    return weight
                }
            } return 0
        }
    }

    function Position(weight, radius, coordinates) {
        weight = weight || 1
        radius = radius || 5
        coordinates = coordinates || new Array()

        this.weight = Setter(this, _ => weight = _)
        this.radius = Setter(this, _ => radius = _)
        this.coordinates = Setter(this, _ => coordinates = _)

        this.heuristic = (position) => {
            for (let coordinate of coordinates) {
                if (position.distanceTo(coordinate) < radius) {
                    return weight
                }
            } return 0
        }
    }

    return {
        Entity,
        Block,
        Position
    }
}