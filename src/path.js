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
                for (let offset of Adjacent) {
                    const nextPos = currentPos.offset(offset[0], 0, offset[1])
                    // check that the existing positon hasn't been added
                    if (Nodes.has(getHash(nextPos))) {
                        continue
                    } else
                    // verify we can get from A to B
                    if (canMoveFrom(currentPos, nextPos)) {
                        const hash = getHash(nextPos)
                        // check that the updated position hasn't been added
                        if (Nodes.has(hash)) {
                            continue
                        } else {
                            const heuristic = goal.heuristic(nextPos) * hazardWeight(hazards, nextPos)
                            const node = new Node(currentNode, heuristic, nextPos)
                            Nodes.add(hash)
                            insertNode(node, Best)
                        }
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

        function canMoveFrom(currentPos, nextPos) {
            let floor1, floor2, ceiling1, ceiling2
            floor1 = floor2 = 0
            ceiling1 = ceiling2 = 0
            
            /*
                Get the amount of space in the next node
            */
            {
                const yf_2 = bot.blockAt(nextPos.offset(0, -1, 0))
                const y0_2 = bot.blockAt(nextPos)
                const y1_2 = bot.blockAt(nextPos.offset(0, 1, 0))
                const y2_2 = bot.blockAt(nextPos.offset(0, 2, 0))

                const yf_2_empty = emptyBlock(yf_2) 
                const y0_2_empty = emptyBlock(y0_2)
                const y1_2_empty = emptyBlock(y1_2)
                const y2_2_empty = emptyBlock(y2_2)

                /*
                    NOTE: this logic will be changed in the future
                    (allow descending nods)
                */
                if (yf_2_empty && y0_2_empty) {
                    console.log("false\n")
                    return false
                }

                floor2 = y0_2_empty
                ? 2 - heightMap[yf_2.stateId].max
                : yf_2_empty
                ? 1 - heightMap[y0_2.stateId].max
                : 2 - Math.max(1 + heightMap[y0_2.stateId].max, heightMap[yf_2.stateId].max)

                ceiling2 = y1_2_empty && y2_2_empty
                ? 2
                : y1_2_empty
                ? 1 + heightMap[y2_2.stateId].min
                : heightMap[y1_2.stateId].min

                /*
                // see if we can climb the ceiling block
                if (ceiling2 < 1 && y2_2_empty) {
                    const y3_2 = bot.blockAt(nextPos.offset(0, 3, 0))
                    const y3_2_empty = emptyBlock(y3_2)

                    if (y3_2_empty) {
                        const feet = 1 - heightMap[y1_2.stateId].max
                        ceiling2 = feet + 2
                    } else {
                        const head = heightMap[y3_2.stateId].min
                        const feet = 1 - heightMap[y1_2.stateId].max
                        ceiling2 = feet + 1 + head
                    }
                }
                */
            }

            console.log(`nextPos: ${floor2} + ${ceiling2} < ${bot.physics.playerHeight} = ${floor2 + ceiling2 < bot.physics.playerHeight}`)

            // not enough space to get to next node
            if (floor2 + ceiling2 < bot.physics.playerHeight) {
                console.log("false\n")
                return false
            }

            /*
                Get the amount of space in the current node
            */
            {
                const yf_1 = bot.blockAt(currentPos.offset(0, -1, 0))
                const y0_1 = bot.blockAt(currentPos)
                const y1_1 = bot.blockAt(currentPos.offset(0, 1, 0))
                const y2_1 = bot.blockAt(currentPos.offset(0, 2, 0))

                const yf_1_empty = emptyBlock(yf_1)
                const y0_1_empty = emptyBlock(y0_1)
                const y1_1_empty = emptyBlock(y1_1)

                floor1 = yf_1_empty && y0_1_empty
                ? 2
                : y0_1_empty // current node is empty
                ? 2 - heightMap[yf_1.stateId].max
                : yf_1_empty // current node isn't empty
                ? 1 - heightMap[y0_1.stateId].max
                : 2 - Math.max(1 + heightMap[y0_1.stateId].max, heightMap[yf_1.stateId].max) // both nodes are solid, pick the tallest block

                ceiling1 = y1_1_empty && emptyBlock(y2_1)
                ? 2
                : y1_1_empty
                ? 1 + heightMap[y2_1.stateId].min
                : heightMap[y1_1.stateId].min // either y2 is empty, or none are empty
            }

            console.log(`currentPos: ${floor1} + ${ceiling1} < ${bot.physics.playerHeight} = ${floor1 + ceiling1 < bot.physics.playerHeight}`)


            const floor = Math.min(floor1, floor2)
            const ceiling = Math.min(ceiling1, ceiling2)

            console.log(`newPos: ${floor} + ${ceiling} < ${bot.physics.playerHeight} = ${floor + ceiling < bot.physics.playerHeight}`)


            // cannot leave the current node
            if (floor + ceiling < bot.physics.playerHeight) {
                console.log("false\n")
                return false
            }

            console.log(`floor2 - floor1: ${Math.abs(floor2 - floor1)}`)

            // change coditions for when ceiling2 was changed (block climb)


            nextPos.y -= floor2 - floor1

            if (unsafeBlock(bot.blockAt(nextPos))) {
                console.log("false\n")
                return false
            }

            console.log("true\n")
            return true
        }
    
        /*
        function canMoveFrom(currentPos, nextPos) {
            const y1 = bot.blockAt(nextPos.offset(0, 1, 0))

            // block obstruction at head height, check if we can go under it
            if (solidBlock(y1)) {
                if (unsafeBlock(y1)) {
                    return false
                }

                const yf = bot.blockAt(currentPos.offset(0, -1, 0))

                if (unsafeBlock(yf) || emptyBlock(yf)) {
                    return false
                }

                const y0 = bot.blockAt(nextPos)
                const feet = Math.abs(heightMap[yf.stateId].max - 1)
                const head = emptyBlock(y0)
                ? 1 + heightMap[y1.stateId].min
                : heightMap[y0.stateId].min

                console.log(`${feet} + ${head} >= ${bot.physics.playerHeight}`)

                if (feet + head >= bot.physics.playerHeight) {
                    return true
                }

            } else
        
            // no block obstruction at head height, check the next block down
            if (emptyBlock(y1)) {
                const y0 = bot.blockAt(nextPos)
        
                if (unsafeBlock(y1)) {
                    return false
                }
        
                if (unsafeBlock(y0)) {
                    return false
                }
        
                // keep going down until we hit a solid block
                if (emptyBlock(y0)) {
                    const lastPos = nextPos.clone()
                    const descendPos = nextPos.offset(0, -1, 0)
        
                    for (let i = 1; i <= depth; i++) {
                        const yi = bot.blockAt(descendPos)
        
                        if (unsafeBlock(yi)) {
                            return false
                        }
        
                        if (solidBlock(yi)) {
                            nextPos.update(lastPos)
                            return true
                        }
        
                        lastPos.y--
                        descendPos.y--
                    }
                } else
        
                // check if we can climb up the block
                if (solidBlock(y0)) {
                    const y2_0 = bot.blockAt(currentPos.offset(0, 2, 0))
        
                    if (unsafeBlock(y2_0)) {
                        return false
                    }

                    const y2_1 = bot.blockAt(nextPos.offset(0, 2, 0))

                    if (unsafeBlock(y2_1)) {
                        return false
                    }

                    const yf = bot.blockAt(currentPos.offset(0, -1, 0))

                    if (unsafeBlock(yf) || emptyBlock(yf)) {
                        return false
                    }

                    if (emptyBlock(y2_0) && emptyBlock(y2_1)) {
                        if (heightMap[y0.stateId].max - heightMap[yf.stateId].max <= 0.25) {
                            nextPos.y += 1
                            return true
                        }
                    }
                }
            }
        
            // cannot get to the next node
            return false
        }
        */
    }
}