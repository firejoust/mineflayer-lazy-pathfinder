const Adjacent = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
]

const Defaults = {
    avoid: new Set(['lava', 'water']),
    depth: 4
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

module.exports.inject = function inject(bot, Setter) {
    return function Path(goal) {
        goal.register(this)

        let { avoid, depth } = Defaults
        this.avoid = Setter(this, (..._) => avoid = new Set(_))
        this.depth = Setter(this, _ => depth = _)
        
        this.execute = function execute() {
            const Nodes = new Set()
            const Best = new Array()
            const Used = new Array()

            const status = {
                blocks: 0,
                timeout: 0
            }

            const interval = setInterval(() => status.timeout++, 1)

            let currentNode
            let currentPos

            {
                const position = bot.entity.position.floored()
                const hash = getHash(position)
                const heuristic = goal.heuristic(position)
                const node = new StartNode(heuristic, position)
                Nodes.add(hash)

                currentNode = node
                currentPos  = position
            }

            while (goal.continue(status) && !goal.complete(currentPos)) {
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
                            const heuristic = goal.heuristic(nextPos)
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
                return avoid.has(block.name)
            }
        }
    
        function canMoveFrom(currentPos, nextPos) {
            const y1 = bot.blockAt(nextPos.offset(0, 1, 0))
            // cannot proceed if block obstruction at head height
            if (solidBlock(y1)) {
                return false
            } else
        
            // no block obstruction at head height
            if (emptyBlock(y1)) {
                const y0 = bot.blockAt(nextPos)
        
                if (unsafeBlock(y1)) {
                    return false
                }
        
                if (unsafeBlock(y0)) {
                    return false
                }
        
                // check if the player can descend
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
        
                        lastPos.translate(0, -1, 0)
                        descendPos.translate(0, -1, 0)
                    }
                } else
        
                // check if the player can climb
                if (solidBlock(y0)) {
                    const y2_0 = bot.blockAt(currentPos.offset(0, 2, 0))
                    const y2_1 = bot.blockAt(nextPos.offset(0, 2, 0))
        
                    if (unsafeBlock(y2_0)) {
                        return false
                    }
        
                    if (unsafeBlock(y2_1)) {
                        return false
                    }
        
                    if (emptyBlock(y2_0) && emptyBlock(y2_1)) {
                        nextPos.translate(0, 1, 0)
                        return true
                    }
                }
            }
        
            // cannot get to the next node
            return false
        }
    }
}