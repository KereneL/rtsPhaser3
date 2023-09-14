import { Game, Types } from 'phaser';
import gameConfig from './config';

window.sizeChanged = () => {
  if (window.game.isBooted) {
      setTimeout(() => {
          //window.game.scale.resize(window.innerWidth, window.innerHeight); window.game.canvas.setAttribute(
          window.game.scale.resize(1024, 768); window.game.canvas.setAttribute(
              'style',
              //`display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`,
              `display: block; width: ${1024}px; height: ${768}px;`,
          );
      }, 100);
  }
};

window.game = new Game(gameConfig);