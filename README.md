#### Node Contents
- The node cost
- The node heuristic
- The node position
- The block type that the player is "standing" on (not always the block at node pos)
- A min/max height gap offset to the node position (bounding box empty, not just air)
- A map of phantom blocks
- A map of scaffold blocks
- The maximum climb height

#### Standing blocks
- Ladder/Vines: Must be touching player's feet
- Liquid: Must be touching player's bounding box

#### Loop:
- Current node block
