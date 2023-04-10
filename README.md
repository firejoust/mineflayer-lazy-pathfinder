#### Installation
```sh
npm install mineflayer-pathfinder-lite
```
#### API
##### Types
```js
class Vec3 = { x, y, z } // https://github.com/PrismarineJS/node-vec3
class PrismarineEntity;  // https://github.com/PrismarineJS/prismarine-entity
```
##### Goals
```js
const { Radius3D, Radius2D, Direction } = require("mineflayer-pathfinder-lite").goals

// path ends within a radius of a 3D coordinate (Vec3)
const goal1 = new Radius3D(destination, radius)

// path ends within a radius of a 2D coordinate
const goal2 = new Radius2D(x, z, radius)

// path ends at node closest to distance in the current facing direction
const goal3 = new Direction(bot, distance)
```
##### Hazards
```js
const hazard1 = new bot.pathfinder.hazards.Block(weight?, avoid?, offset?)
  .weight(number) // multiplier for a node's heuristic (1 + weight)
  .offset(Vec3)   // where to check relative to the node (default: block under node)
   .avoid(...string[]) // names of blocks to avoid
  
const hazard2 = new bot.pathfinder.hazards.Entity(weight?, radius?, entities?)
  .weight(number) // multiplier for a node's heuristic (1 + weight)
  .radius(number) // distance from an entity which weight will be applied
  .entities(...PrismarineEntity) // entities to avoid
  
const hazard3 = new bot.pathfinder.hazards.Location(weight?, radius?, coordinates?)
  .weight(number) // multiplier for a node's heuristic (1 + weight)
  .radius(number) // distance from a coordinate which weight will be applied
  .coordinates(...Vec3[]) // coordinates to avoid
```
##### Path
```js
// the closest path from A to B
const path = new bot.pathfinder.Path(goal, ...hazards?)
  .avoid(...string[]) // the names of blocks to avoid (default: 'water', 'lava')
  .depth(number)      // how deep in blocks the pathfinder can descend nodes (default: 4 blocks)
  .blocks(number)     // limit of how many blocks to check for adjacent nodes (destination not reached)
  .timeout(number)    // limit of how long in ms before returning the path (destination not reached)
  .execute()
  
// path will return as Vec3[] array
```
#### Example
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
