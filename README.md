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
    const goal = new Radius3D(entity.position, 3)
    // all of the setters are optional
    const path = new bot.pathfinder.Path(goal)
      .blocks(5000)
      .timeout(10)
      .avoid('lava', 'water')
      .depth(4)
      .execute()
      
    console.log(path)
  }
})
```
#### API
##### Types
```ts
type Vec3 = { x, y, z } // https://github.com/PrismarineJS/node-vec3
```
##### Goals
```js
const { Radius3D, Radius2D, Direction } = require("mineflayer-pathfinder-lite").goals

// path ends within a radius of a 3D coordinate (vec3)
const goal1 = new Radius3D(destination, radius)

// path ends within a radius of a 2D coordinate
const goal2 = new Radius2D(x, z, radius)

// path ends at node closest to distance in the current facing direction
const goal3 = new Direction(bot, distance)
```
##### Path
```js
// the closest path from A to B
const path = new bot.pathfinder.Path(goal)
  .avoid(...string[]) // the names of blocks to avoid (default: 'water', 'lava')
  .depth(number)   // how deep in blocks the pathfinder can descend nodes (default: 4 blocks)
  .blocks(number)  // limit of how many blocks to check for adjacent nodes (destination not reached)
  .timeout(number) // limit of how long in ms before returning the path (destination not reached)
  .execute()
  
// path will return as vec3[] array
```
