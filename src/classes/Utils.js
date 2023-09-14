export function findPath(start, target, groundLayer) {
    // no path if select invalid tile
    if (!groundLayer.getTileAt(target.x, target.y)) {
        return []
    }
    const toKey = (x, y) => `${x}x${y}`

    const queue = []
    const parentForKey = {} //:{ [key: string]: { key: string, position: TilePosition } }

    const startKey = toKey(start.x, start.y)
    const targetKey = toKey(target.x, target.y)

    parentForKey[startKey] = {
        key: '',
        position: { x: -1, y: -1 }
    }

    queue.push(start)

    while (queue.length > 0) {
        const { x, y } = queue.shift();
        const currentKey = toKey(x, y)

        if (currentKey === targetKey) {
            break;
        }

        const neighbors = [
            { x, y: y - 1 },	// top
            { x: x + 1, y }, 	// right
            { x, y: y + 1 },	// bottom
            { x: x - 1, y }		// left
        ]

        //send True if tile is free to move to
        const checkNeighbors = (neighbor) => {
            const tile = groundLayer.getTileAt(neighbor.x, neighbor.y)
            if (!tile) { return false }
            if (tile.properties.collides) { return false }

            return true;
        }
        for (let i = 0; i < neighbors.length; ++i) {
            const neighbor = neighbors[i]
            if (!checkNeighbors(neighbor)) continue;

            const key = toKey(neighbor.x, neighbor.y)

            if (key in parentForKey) { continue }

            parentForKey[key] = {
                key: currentKey,
                position: { x, y }
            }

            queue.push(neighbor)
        }
    }

    const path = []

    let targetPush = groundLayer.tileToWorldXY(target.x, target.y);
    targetPush.x += (groundLayer.tilemap.tileWidth / 2);
    targetPush.y += (groundLayer.tilemap.tileHeight / 2);
    console.log(targetPush)

    path.push(targetPush);
    let currentPos = undefined;
    let currentKey = targetKey;

    if (parentForKey.hasOwnProperty(targetKey)) {
        currentPos = parentForKey[targetKey].position;
    } else {
        return []
    }

    while (currentKey !== startKey) {
        targetPush = groundLayer.tileToWorldXY(currentPos.x, currentPos.y);
        targetPush.x += groundLayer.tilemap.tileWidth / 2;
        targetPush.y += groundLayer.tilemap.tileHeight / 2;
        path.push(targetPush);

        const { key, position } = parentForKey[currentKey];
        currentKey = key;
        currentPos = position;
    }

    console.log (path);
    return path.reverse()
}