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
- All accessible "Standing blocks" in current node are checked/added to queue
- Phantom block place/break checks in current node and new nodes added to queue
- Adjacent cardinal node checks:
  - Get all gaps accessible from current node, add solid nodes with their associated gap
  - Acccessible standing blocks (from current node) checked/added
  - Phantom block place/break check nodes checked/added
