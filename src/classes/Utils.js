export const select = {
    add: function(){
        this.selectable = true;
        this.makeSelectable()

    },
    makeSelectable: function () {
        this.createSelectorRing();

        this.selected = false;
        this.hitRect = new Phaser.Geom.Rectangle(12, 12, 8, 8)
        this.setInteractive(this.hitRect, Phaser.Geom.Rectangle.Contains);
        //behavior changes unexpectedly with this:
        //this.scene.input.enableDebug(this, 0xFFFF00);

        this.on('pointerover', this.selectablePointerOver);
        this.on('pointerout', this.selectablePointerOut);
        this.on('pointerdown', this.selectablePointerDown);
    },
    positionSelectorRing: function () {
        const tileWidth = this.scene.map.tileWidth;
        const tileHeight = this.scene.map.tileHeight;
        this.selector.setPosition(this.x - (tileWidth * 1.1 - tileWidth) / 4, this.y + tileHeight / 3)
    },
    selectablePointerOver: function ()  {
        if (!this.selected) {
            this.selector.setVisible(true)
            this.scene.marker.setVisible(false)
        }
    },
    selectablePointerOut: function ()  {
            if (!this.selected) {
                this.selector.setVisible(false)
                this.scene.marker.setVisible(true)
            }
    },
    selectablePointerDown: function ()  {
        // Multiple select with ctrl, append to selection
        if (this.scene.input.keyboard.addKey('CTRL').isDown) {
            if (!this.selected) {
                this.selectUnit();
            }
            // or else reset selection and select single unit
        } else {
            this.scene.selectionDeselect();
            this.selectUnit();
        }
    },
    selectUnit: function ()  {
        if (!this.selected) {
            this.selector.setVisible(true)
            this.scene.marker.setVisible(true)
            
            this.positionSelectorRing();
            this.selector.setStrokeStyle(1, 0x00FF00, 1);

            this.selected = true;
            this.scene.selected.add(this);
            document.getElementById('hover-text').textContent = this.key;
        }
    },
    deselectUnit: function ()  {
            this.selector.setVisible(false)
            this.selector.setStrokeStyle(1, 0xFFFFFF, 1);
            this.scene.selected.delete(this);
            this.guideLine.setVisible(false)
            this.selected = false;
    },
    createSelectorRing: function ()  {
        const tileWidth = this.scene.map.tileWidth;
        const tileHeight = this.scene.map.tileHeight;

        this.selector = new Phaser.GameObjects.Ellipse(this.scene, 0, 0, tileWidth * 1.1, tileHeight / 2)
        this.selector.setStrokeStyle(1, 0xFFFFFF, 1)
        this.selector.setVisible(false)
        this.selector.setDepth(49);
        this.positionSelectorRing();
        this.selector.isFilled = false;
        this.scene.add.existing(this.selector);
    }
}
export const move = {
    add: function() {
        this.moveable = true;
        this.isMoving = false;
        this.createGuideLine();

        this.updateMethods.push(this.updateMethod)
    },
    updateMethod: function (gameObject,delta) {
        if (gameObject.isMoving){
            gameObject.updateMovement(delta)
        };
    },
    createGuideLine: function () {
        this.guideLine = new Phaser.GameObjects.Line(this.scene, this.x, this.y, 0, 0, 0, 0, 0xffffff, 0.15);
        this.guideLine.setLineWidth(0.5);
        this.guideLine.setOrigin(0);
        this.guideLine.setVisible(false);
        this.guideLine.setDepth(700);
        this.setOrigin(0.5, 0.5)
        this.setDepth(50)
        this.scene.add.existing(this.guideLine);
    },
    updateMovement: function (delta) {
        let dx = 0
        let dy = 0
        const speed = Math.min((1/30)*(delta/100)*this.speed);

        if (this.moveToTarget) {
            dx = this.moveToTarget.x - this.x
            dy = this.moveToTarget.y - this.y

            //controls
            if (Math.abs(dx) < 1 || Math.abs(dx) - speed < 0) {
                dx = Phaser.Math.RoundTo(dx, 2)
            }
            if (Math.abs(dy) < 1 || Math.abs(dy) - speed < 0) {
                dy = Phaser.Math.RoundTo(dy, 2)
            }

            if (dx === 0 && dy === 0) {
                if (this.movePath.length > 0) {
                    this.moveTo(this.movePath.shift())
                    return;
                } else {

                    // End Walk
                this.isMoving = false;
                this.moveToTarget = undefined
                this.stopWalk();
                    return;
                }
            }

            
            const vector = new Phaser.Math.Vector2(dx, dy);
            this.changeDirection(vector);

            if (vector.x < 0) {this.x -= speed}
            else if (vector.x > 0) {this.x += speed}
            else if (vector.y < 0) {this.y -= speed}
            else if (vector.y > 0) {this.y += speed}
            this.positionSelectorRing();

            const targetPosition = new Phaser.Math.Vector2(this.guideLine.x, this.guideLine.y);
            const currentPosition = new Phaser.Math.Vector2(this.x, this.y);
            const difference = currentPosition.subtract(targetPosition);
            this.guideLine.setTo(0, 0, difference.x, difference.y);

        } else {
            return;
        }

    },
    orderMove: function () {
        const currentTileX = this.scene.map.worldToTileX(this.x);
        const currentTileY = this.scene.map.worldToTileY(this.y);
        const currentTileXY = new Phaser.Math.Vector2(currentTileX, currentTileY);

        const poinerPosition = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
        const targetTileX = this.scene.map.worldToTileX(poinerPosition.x);
        const targetTileY = this.scene.map.worldToTileY(poinerPosition.y);
        const targetTileXY = new Phaser.Math.Vector2(targetTileX, targetTileY);

        const targetWorldX = this.scene.map.tileToWorldX(targetTileX) + this.scene.map.tileWidth / 2
        const targetWorldY = this.scene.map.tileToWorldY(targetTileY) + this.scene.map.tileHeight / 2
        //const targetWorldXY = new Phaser.Math.Vector2(targetWorldX, targetWorldY);

        this.guideLine.x = targetWorldX
        this.guideLine.y = targetWorldY

        let path = findPath(currentTileXY, targetTileXY, this.scene.groundLayer);
        if (path.length > 0) {
            this.action = 'walk'
            this.moveAlong(path);
            this.walkAnimation()
            this.guideLine.setVisible(true)
            this.isMoving = true;
        } else {
            this.stopWalk()
            this.guideLine.setVisible(false)
        }
    },
    idle: function () {
        this.action = 'idle';
        this.playAnim(this.action);
    },
    stopWalk: function () {
        this.isMoving = false;
        this.moveToTarget = undefined
        this.standstillFrame()
    },
    walkAnimation: function ()  {
        this.action = 'walk';
        this.playAnim(this.action);
    },
    moveAlong: function (path) {
        if (!path || path.length <= 1) {this.stopWalk();  return;}
            
        this.movePath = path;
        const next = this.movePath.shift();
        this.moveTo(next)
    },
    moveTo: function (target) {
        this.moveToTarget = target
    },
    calcOrientation(vector) {
        if (vector.x > 0) this.horizontalOrient = 'e'
        if (vector.x < 0) this.horizontalOrient = 'w'
        if (vector.y >= 0) this.verticalOrient = 's'
        if (vector.y < 0) this.verticalOrient = 'n'
    },
    changeDirection: function (vector) {
        this.calcOrientation(vector)
        let progress = this.anims.getProgress()
        this.playAnim(this.action)
        this.anims.setProgress(progress)
    },
    playAfterRepeatAnim: function (action) {
        let animKey = `${this.key}` +
            `-${action}` +
            `-${this.verticalOrient}` +
            `${this.horizontalOrient}`
        this.playAfterRepeat(animKey);
    },
    playAnim: function (action) {
        let animKey = `${this.key}` +
            `-${action}` +
            `-${this.verticalOrient}` +
            `${this.horizontalOrient}`

        this.play(animKey, true)
    },


}
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
                position: {
                    x,
                    y
                }
            }

            queue.push(neighbor)
        }
    }

    const path = []

    let targetPush = groundLayer.tileToWorldXY(target.x, target.y);
    targetPush.x += (groundLayer.tilemap.tileWidth / 2);
    targetPush.y += (groundLayer.tilemap.tileHeight / 2);

    path.push(targetPush);
    let currentPos = undefined;
    let currentKey = targetKey;

    if (parentForKey.hasOwnProperty(targetKey)) {
        currentPos = parentForKey[targetKey].position;
    } else {
        console.log("invalid target");
        return [];
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

    return path.reverse();
}