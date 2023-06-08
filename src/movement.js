module.exports.inject = function inject(bot) {
    const config = {
        headless: false,
        timeout: 2000,
        interval: 50,
        horizontalRadius: 0.3,
        verticalRadius: 0.1
    }

    function getHorizontalRadius(node) {
        const x = node.x - bot.entity.position.x
        const z = node.z - bot.entity.position.z
        return Math.sqrt(x ** 2 + z ** 2)
    }

    function withinRadius(node) {
        const horizontal = getHorizontalRadius(node)
        const vertical = Math.abs(node.y - bot.entity.position.y)
        return horizontal <= config.horizontalRadius
            && vertical <= config.verticalRadius
            && bot.entity.onGround
    }

    async function setControls(node) {
        if (config.headless) {
            // not yet implemented
            throw new Error("Not yet implemented")
        } else {
            await bot.lookAt(node.offset(0, bot.entity.height, 0), true)
            bot.setControlState("forward", getHorizontalRadius(node) > config.horizontalRadius)
            bot.setControlState("jump", bot.entity.isCollidedHorizontally
                || bot.entity.isInWater
                || bot.entity.isInLava)
        }
    }

    async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    return async path => {
        path = Array.from(path)

        while (path.length > 0) {
            const node = path.shift().offset(0.5, 0, 0.5)
            
            // continue until we get to the next node
            for (let i = 0; !withinRadius(node); i += config.interval) {
                await setControls(node)
                await delay(config.interval)

                if (i > config.timeout) {
                    throw new Error("Movement timed out getting to next node")
                }
            }
        }

        bot.clearControlStates()
    }
}