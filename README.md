#### Installation
```sh
npm install mineflayer-pathfinder-lite
```
#### Usage
```js
const { Radius3D, Radius2D, Direction } = require("mineflayer-pathfinder-lite").goals
const pathfinder = require("mineflayer-pathfinder-lite").plugin
const mineflayer = require("mineflayer")

const bot = mineflayer.createBot()

bot.loadPlugin(pathfinder)

bot.once("spawn", function init() {
  const entity = bot.nearestEntity(entity => entity.type === "player")
  
  if (entity === null) {
    bot.chat("No player found")
  } else {
    const goal = new Radius3D(entity.position)
      .radius(3)
      .blocks(10000)
      .timeout(10)
      
    const path = new bot.pathfinder.Path(goal)
      .avoid('lava', 'water')
      .depth(4)
      .execute()
      
    console.log(path)
  }
})
```
