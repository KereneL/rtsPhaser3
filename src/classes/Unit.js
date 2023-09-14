import Phaser from 'phaser';
import { findPath } from './Utils';
export class Unit extends Phaser.GameObjects.Sprite {
    static tinted = new Set();

    constructor(config) {
        const tileX = config.scene.map.tileToWorldX(config.x) + config.scene.map.tileWidth / 2
        const tileY = config.scene.map.tileToWorldY(config.y) + config.scene.map.tileHeight / 2

        super(config.scene, tileX, tileY, config.key);
        this.scene = config.scene;
        this.key = config.key;
        this.init();
        this.makeSelectable();
        this.scene.add.existing(this);
    }
    init() {
        this.action = 'idle';
        this.horizontalOrient = 'e'
        this.verticalOrient = 's'
        this.playAnim(this.action)
        this.standstillFrame()

        this.guideLine = new Phaser.GameObjects.Line(this.scene, this.x, this.y, 0, 0, 0, 0, 0xffffff, 1);
        this.guideLine.setLineWidth(0.5);
        this.guideLine.setOrigin(0);
        this.guideLine.setVisible(false);
        this.guideLine.setDepth(700);
        this.scene.add.existing(this.guideLine);
        this.setOrigin(0.5, 0.5)
        this.setDepth(50)
    }
    update() {
        let dx = 0
        let dy = 0

        if (this.moveToTarget) {
            dx = this.moveToTarget.x - this.x
            dy = this.moveToTarget.y - this.y

            if (Math.abs(dx) < 1) {
                dx = Phaser.Math.RoundTo(dx, 0)
            }
            if (Math.abs(dy) < 1) {
                dy = Phaser.Math.RoundTo(dy, 0)
            }

            if (dx === 0 && dy === 0) {
                if (this.movePath.length > 0) {
                    this.moveTo(this.movePath.shift())
                    return
                }

                this.moveToTarget = undefined
            }
            this.selectorPosition();

        }

        const left = dx < 0
        const right = dx > 0
        const up = dy < 0
        const down = dy > 0

        const vector = new Phaser.Math.Vector2(dx, dy);

        this.redirectOrientation(vector);
        const speed = 1

        if (left) {
            this.x -= speed
        } else if (right) {
            this.x += speed
        } else if (up) {
            this.y -= speed
        } else if (down) {
            this.y += speed
        } else {
            this.idle()
        }

        const targetPosition = new Phaser.Math.Vector2(this.guideLine.x, this.guideLine.y);
        const currentPosition = new Phaser.Math.Vector2(this.x, this.y);
        const difference = currentPosition.subtract(targetPosition);

        this.guideLine.setTo(0, 0, difference.x, difference.y);
    }

    makeSelectable() {
        const tileWidth = this.scene.map.tileWidth;
        const tileHeight = this.scene.map.tileHeight;

        this.setInteractive(this.hitRect, Phaser.Geom.Rectangle.Contains);
        this.selected = false;

        this.selector = new Phaser.GameObjects.Ellipse(this.scene, 0, 0, tileWidth * 1.1, tileHeight / 2)
            .setStrokeStyle(1, 0xFFFFFF, 1)
            .setVisible(false)
            .setDepth(800);
        this.selectorPosition();
        this.selector.isFilled = false;
        this.scene.add.existing(this.selector);
        console.log(this.selector)

        //this.scene.input.enableDebug(this, 0xffff00);

        const sprite = this;
        console.log(this.key)

        sprite.on('pointerover', () => {
            if (!this.selected) {
                this.selectorPosition();
                this.selector.setVisible(true)
            }
        });
        sprite.on('pointerout', () => {
            if (!sprite.scene.isSelecting) {
                if (!this.selected) {
                    this.selector.setVisible(false)
                }
            }
        });
        sprite.on('pointerdown', () => {
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
        });

    }
    selectorPosition() {
        const tileWidth = this.scene.map.tileWidth;
        const tileHeight = this.scene.map.tileHeight;
        this.selector.setPosition(this.x - (tileWidth * 1.1 - tileWidth) / 4, this.y + tileHeight / 3)
    }
    selectablePointerOver() {

    }
    selectablePointerOut() {

    }
    selectablePointerDown() {

    }
    selectUnit() {
        if (!this.selected) {
            this.selector.setVisible(true)
            this.selectorPosition();
            this.selector.setStrokeStyle(1, 0x00FF00, 1);

            this.selected = true;
            this.scene.selected.add(this);
            Unit.tinted.add(this);
            this.guideLine.setVisible(true)
            document.getElementById('hover-text').textContent = this.key;
        }
    }
    deselectUnit() {
        if (this.selected) {
            this.selector.setVisible(false)
            this.selector.setStrokeStyle(1, 0xFFFFFF, 1);
            this.selected = false;
            this.scene.selected.delete(this);
            Unit.tinted.delete(this);
            this.guideLine.setVisible(false)
        }
    }
    orderMove() {
        const currentTileX = this.scene.map.worldToTileX(this.x);
        const currentTileY = this.scene.map.worldToTileY(this.y);
        const currentTileXY = new Phaser.Math.Vector2(currentTileX, currentTileY);

        const poinerPosition = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
        const targetTileX = this.scene.map.worldToTileX(poinerPosition.x);
        const targetTileY = this.scene.map.worldToTileY(poinerPosition.y);
        const targetTileXY = new Phaser.Math.Vector2(targetTileX, targetTileY);

        const targetWorldX = this.scene.map.tileToWorldX(targetTileX) + this.scene.map.tileWidth / 2
        const targetWorldY = this.scene.map.tileToWorldY(targetTileY) + this.scene.map.tileHeight / 2
        const targetWorldXY = new Phaser.Math.Vector2(targetWorldX, targetWorldY);

        this.guideLine.x = targetWorldX
        this.guideLine.y = targetWorldY

        let path = findPath(currentTileXY, targetTileXY, this.scene.groundLayer);
        if (path.length > 0) {
            this.action = 'walk'
            this.moveAlong(path);
            this.playAfterRepeatAnim('walk')
        } else {
            this.stopWalk()
        }
    }
    stopWalk() {
        this.moveToTarget = undefined
    }
    walkAnimation() {
        this.action = 'walk';
        this.playAnim(this.action);
    }
    moveAlong(path) {
        if (!path || path.length <= 0) return;

        this.movePath = path;

        const next = this.movePath.shift();
        this.moveTo(next)
    }
    moveTo(target) {

        this.moveToTarget = target
    }
    calcOrientation(vector) {
        if (vector.x > 0) this.horizontalOrient = 'e'
        if (vector.x < 0) this.horizontalOrient = 'w'
        if (vector.y >= 0) this.verticalOrient = 's'
        if (vector.y < 0) this.verticalOrient = 'n'
    }
    redirectOrientation(vector) {
        this.calcOrientation(vector)
        const currentFrame = this.anims.getProgress();
        this.playAnim('walk');
        this.anims.setProgress(currentFrame);
    }
    playAfterRepeatAnim(action) {
        let animKey = `${this.key}` +
            `-${action}` +
            `-${this.verticalOrient}` +
            `${this.horizontalOrient}`
        this.playAfterRepeat(animKey);
    }
    playAnim(action) {
        let animKey = `${this.key}` +
            `-${action}` +
            `-${this.verticalOrient}` +
            `${this.horizontalOrient}`
        this.play(animKey, true)
    }
    standstillFrame() {
        let standStill = () => {
            this.anims.pause()
            this.anims.setProgress(0)
        }
        this.on('animationcomplete', standStill);
    }
    idle() {
        this.action = 'idle';
        this.playAnim(this.action);
    }
}