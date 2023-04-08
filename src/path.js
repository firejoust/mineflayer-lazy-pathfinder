const Adjacent = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
]

function Node(parent, heuristic, position) {
    this.parent = parent
    this.heuristic = heuristic
    this.position = position
    this.cost = parent.cost + 1
}

function getHash(position) {
    return (position.x, position.y, position.z)
}

function insertNode(node, nodeList) {

}

function getBestIndex(nodeList) {

}

module.exports.inject = function inject(bot) {
    function canMoveFrom(currentPos, nextPos) {

    }

    return function Path(goal) {
        goal.register(this)

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
    }
}