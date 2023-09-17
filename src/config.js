import Phaser from 'phaser';
import { FirstScene } from './scenes/firstScene';

const gameConfig = {
    title: 'Phaser game tutorial',
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#444',
    seed: [ 0 ],
    scale: {
        mode: Phaser.Scale.ScaleModes.NONE,
        width: 1024,
        height: 768,
    },
    render: {
        antialiasGL: false,
        roundPixels: true,
        pixelArt: true,
    },
    callbacks: {
        postBoot: () => {
            window.sizeChanged();
        },
    },
    canvasStyle: `display: block; width: 100%; height: 100%;`,
    autoFocus: true,
    audio: {
        disableWebAudio: false,
    },
    fps: { forceSetTimeOut: true, target: 30 },
    scene: [FirstScene],
};

export default gameConfig;