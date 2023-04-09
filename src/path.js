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

function Node(parent, heuristic, position) {
    this.parent = parent
    this.heuristic = heuristic
    this.position = position
    this.cost = parent.cost + 1
    this.total = this.heuristic + this.cost
}

function getHash(position) {
    return (position.x, position.y, position.z)
}

function getBestIndex(nodeList, node) {
    let low = 0
    let high = nodeList.length - 1
    let mid

    while (low <= high) {
        mid = Math.floor((low + high) / 2)
        if (nodeList[mid].total < node.total) {
            low = mid + 1
        } else
        
        if (nodeList[mid].total > node.total) {
            high = mid - 1
        } else
        
        return mid
    }

    return low
}

function insertNode(node, nodeList) {
    const length = nodeList.length
    for (let index = 0; index < length; index++) {
        if (node.total < nodeList[index].total) {
            nodeList.splice(index, 0, node)
            return
        }
    }
    nodeList.push(node) // no elements in array
}

module.exports.inject = function inject(bot, Set) {
    return function Path(goal) {
        goal.register(this)

        let { avoid, depth } = Defaults
        this.avoid = Set(this, _ => avoid = _)
        this.depth = Set(this, _ => depth = _)
        
        this.execute = function execute() {
            const Nodes = new Set()
            const Best = new Array()

            const status = {
                blocks: 0,
                timeout: 0
            }

            const interval = setInterval(() => status.timeout++, 1)

            let currentIndex = 0
            let currentPos = bot.entity.position.floored()
            let currentNode = { parent: null, cost: 0 }

            Nodes.add(getHash(currentPos))

            while (goal.continue(status) && !goal.complete(currentPos)) {
                for (let offset of Adjacent) {
                    const nextPos = currentPos.offset(offset[0], 0, offset[1])
                    if (Nodes.has(getHash(currentPos))) {
                        continue
                    } else

                    if (canMoveFrom(currentPos, nextPos)) {
                        const heuristic = goal.heuristic(currentPos, nextPos)
                        const node = new Node(currentNode, heuristic, nextPos)
                        Nodes.add(getHash(nextPos))
                        insertNode(node, Best)
                    }
                }

                // void the existing node and set the next best
                Best[currentIndex] = null
                currentIndex = getBestIndex(Best)
                currentNode = Best[currentIndex]
                currentPos = currentNode.position

                // increment the traversed blocks
                blocks++
            }

            clearInterval(interval)
        }


        function solidBlock(block) {
            return block?.boundingBox === 'solid'
        }

        function emptyBlock(block) {
            return block === null
                || block.boundingBox === 'empty'
        }

        function unsafeBlock(block) {
            return !(block === null
                || avoid.has(block.type))
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
                    const lastPos = nextPos
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