import Phaser from 'phaser';
import {select, move} from './Utils';

export class Unit extends Phaser.GameObjects.Sprite {
    constructor(config) {
        const tileX = config.scene.map.tileToWorldX(config.x) + config.scene.map.tileWidth / 2
        const tileY = config.scene.map.tileToWorldY(config.y) + config.scene.map.tileHeight / 2

        super(config.scene, tileX, tileY, config.key);
        this.scene = config.scene;
        this.key = config.key;
        this.speed = config.speed;
        this.updateMethods = [];
        this.init();

        this.scene.add.existing(this);

    }
    init() {
        Object.assign(this, select).add();
        Object.assign(this, move).add();

        this.action = 'idle';
        this.horizontalOrient = 'e';
        this.verticalOrient = 's';

        let animKey = `${this.key}` +
        `-${this.action}` +
        `-${this.verticalOrient}` +
        `${this.horizontalOrient}`;

        this.play(animKey);
        this.anims.stop();
        this.anims.setProgress(0);
        //this.idle();
        //this.standstillFrame();
    }
    update(delta) {
        for (let i = 0; i < this.updateMethods.length; i++){
            const method = this.updateMethods[i]
            method(this,delta)
        }
    }
    standstillFrame() {
        this.playAnim('idle');
    }
}