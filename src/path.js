const Adjacent = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
]

const Defaults = {
    avoid: { 'lava': true, 'water': true },
    depth: 4,
    blocks: 10000,
    timeout: 10
}

const Setter = (instance, callback) => {
    return (...args) => {
        callback(...args)
        return instance
    }
}

function StartNode(heuristic, position) {
    this.parent = null
    this.heuristic = heuristic
    this.position = position
    this.cost = 0
    this.total = heuristic
}

function Node(parent, heuristic, position) {
    this.parent = parent
    this.heuristic = heuristic
    this.position = position
    this.cost = parent.cost + 1
    this.total = this.heuristic + this.cost
}

function getHash(position) {
    return position.x + ' ' + position.y + ' ' + position.z
}

function insertNode(node, nodeList) {
    const length = nodeList.length
    // terminate after we've found its place
    for (let index = 0; index < length; index++) {
        if (node.total < nodeList[index].total) {
            nodeList.splice(index, 0, node)
            return
        }
    }
    // node is higher than all elements
    nodeList.push(node)
}

function hazardWeight(hazards, position) {
    let multiplier = 1
    hazards.forEach(hazard => {
        multiplier *= 1 + hazard.heuristic(position)
    })
    return multiplier
}

function getMaxY(shapes) {
    let maxY = 0
    for (let box of shapes) {
        if (box[1] > maxY) {
            maxY = box[1]
        }
        if (box[4] > maxY) {
            maxY = box[4]
        }
    }
    return maxY
}

function getMinY(shapes) {
    let minY = Infinity
    for (let box of shapes) {
        if (box[1] < minY) {
            minY = box[1]
        }
        if (box[4] < minY) {
            minY = box[4]
        }
    }
    return minY
}

function HeightMap(data) {
    for (let block of data.blocksArray) {
        const stateMax = block.maxStateId - block.minStateId

        if (stateMax === 0) {
            this[block.minStateId || block.stateId] = {
                max: getMaxY(block.shapes),
                min: getMinY(block.shapes)
            }
        } else

        if (block.stateShapes === undefined) {
            for (let i = 0; i <= stateMax; i++) {
                this[block.minStateId + i] = {
                    max: getMaxY(block.shapes),
                    min: getMinY(block.shapes)
                }
            }
        } else

        {
            for (let i = 0; i <= stateMax; i++) {
                this[block.minStateId + i] = {
                    max: getMaxY(block.stateShapes[i]),
                    min: getMinY(block.stateShapes[i])
                }
            }
        }
    }
}

module.exports.inject = function inject(bot) {
    const heightMap = new HeightMap(bot.registry)

    return function Path(goal, ...hazards) {
        let { avoid, depth, blocks, timeout } = Defaults
        this.avoid = Setter(this, _ => avoid = _)
        this.depth = Setter(this, _ => depth = _)
        this.blocks = Setter(this, _ => blocks = _)
        this.timeout = Setter(this, _ => timeout = _)
        
        this.execute = function execute() {
            const Nodes = new Set()
            const Best = new Array()
            const Used = new Array()

            const status = {
                blocks: 0,
                timeout: 0
            }

            const keepalive = () => {
                return status.blocks < blocks &&
                       status.timeout < timeout
            }

            const interval = setInterval(() => status.timeout++, 1)

            let currentNode
            let currentPos

            {
                const position = bot.entity.position.floored()
                const hash = getHash(position)
                const heuristic = goal.heuristic(position) * hazardWeight(hazards, position)
                const node = new StartNode(heuristic, position)
                Nodes.add(hash)

                currentNode = node
                currentPos  = position
            }

            while (keepalive() && !goal.complete(currentPos)) {
                const bounds = yBounds(currentPos)

                // current position is not a valid node; cannot continue
                if (bounds === null) {
                    break
                }

                for (let offset of Adjacent) {
                    const nextPos = currentPos.offset(offset[0], 0, offset[1])

                    // check that the existing positon hasn't been added
                    if (Nodes.has(getHash(nextPos))) {
                        continue
                    }

                    const nextBounds = yBoundsNext(nextPos, bounds[0])

                    if (nextBounds === null) {
                        continue
                    }

                    // verify we can get from A to B
                    if (canMoveTo(nextPos, bounds, nextBounds)) {
                        const hash = getHash(nextPos)

                        // check the updated position with the new Y offset hasn't already been added
                        if (Nodes.has(hash)) {
                            continue
                        }

                        const heuristic = goal.heuristic(nextPos) * hazardWeight(hazards, nextPos)
                        const node = new Node(currentNode, heuristic, nextPos)
                        Nodes.add(hash)
                        insertNode(node, Best)
                    }
                }

                Used.push(currentNode)
                currentNode = Best.shift()

                // no more available spaces to move
                if (currentNode === undefined) {
                    break
                } else {
                    currentPos = currentNode.position
                }

                // increment the traversed blocks
                status.blocks++
            }

            clearInterval(interval)

            // no nodes were added, so return an empty array
            {
                if (Used.length === 0) {
                    return []
                }
            }

            // if we haven't reached the goal, set the node closest to the goal
            {
                if (!goal.complete(currentPos)) {
                    currentNode = Used[0]
                    for (let node of Used) {
                        if (node.heuristic < currentNode.heuristic) {
                            currentNode = node
                        }
                    }
                }
            }

            // return the final path taken
            {
                const path = new Array()

                while (currentNode.parent) {
                    path.push(currentNode.position)
                    currentNode = currentNode.parent
                }

                return path.reverse()
            }
        }


        function solidBlock(block) {
            return block && block.boundingBox === 'block'
        }

        function emptyBlock(block) {
            return block === null || block.boundingBox === 'empty'
        }

        function unsafeBlock(block) {
            if (block === null) {
                return false
            } else {
                return Boolean(avoid[block.name])
            }
        }

        function yBounds(position) {
            let floor = -1
            let ceiling = 4
            let available = 0
            let gapFound = false

            for (let i = 3; i >= -1; i--) {
                const pos = position.offset(0, i, 0)
                const block = bot.blockAt(pos)

                // block is listed as unsafe; terminate
                if (unsafeBlock(block)) {
                    return null
                } else

                // get the height of the blocks below the higher block (fence boost, etc)
                if (gapFound) {
                    if (solidBlock(block)) {
                        floor = Math.max(floor, heightMap[block.stateId].max + i)
                    } break
                } else
                
                // no gap has been found, keep allocating empty space
                {
                    if (emptyBlock(block)) {
                        available += 1
                    } else

                    if (solidBlock(block)) {
                        const space = 1 - heightMap[block.stateId].max
                        const maximum = available + space
                    
                        // solid block found; end it here if we have enough space
                        if (maximum >= bot.physics.playerHeight) {
                            floor = heightMap[block.stateId].max + i
                            available = maximum
                            gapFound = true
                        } else

                        // not enough available space; reset to find the next gap
                        {
                            available = heightMap[block.stateId].min
                            ceiling = available + i
                        }
                    }
                }
            }

            return gapFound
            ? [floor, ceiling]
            : null
        }

        function yBoundsNext(position, lastFloor) {
            let floor = -depth
            let ceiling = 4
            let available = 0
            let gapFound = false

            for (let i = 3; i >= -depth; i--) {
                const pos = position.offset(0, i, 0)
                const block = bot.blockAt(pos)

                // block is listed as unsafe; terminate
                if (unsafeBlock(block)) {
                    return null
                } else

                // get the height of the blocks below the higher block (fence boost, etc)
                if (gapFound) {
                    if (solidBlock(block)) {
                        floor = Math.max(floor, heightMap[block.stateId].max + i)
                    } break
                } else
                
                // no gap has been found, keep allocating empty space
                {
                    if (emptyBlock(block)) {
                        available += 1
                    } else

                    if (solidBlock(block)) {
                        const space = 1 - heightMap[block.stateId].max
                        const maximum = available + space
                        
                        // solid block found; end it here if we have enough space
                        if (maximum >= bot.physics.playerHeight && i < 2) {
                            floor = heightMap[block.stateId].max + i

                            if (floor - lastFloor > 1.25) {
                                available = heightMap[block.stateId].min
                                ceiling = available + i
                                floor = -depth
                                continue
                            }

                            available = maximum
                            gapFound = true
                        } else

                        // not enough available space; reset to find the next gap
                        {
                            available = heightMap[block.stateId].min
                            ceiling = available + i
                        }
                    }
                }
            }

            return gapFound
            ? [floor, ceiling]
            : null
        }

        function canMoveTo(position, bounds, boundsNext) {
            const floor = boundsNext[0] > bounds[0]
            ? boundsNext[0]
            : bounds[0]

            const ceiling = boundsNext[1] < bounds[1]
            ? boundsNext[1]
            : bounds[1]

            if (ceiling - floor >= bot.physics.playerHeight) {
                position.y += boundsNext[0] - bounds[0]
                return true
            }

            return false
        }
    }
}