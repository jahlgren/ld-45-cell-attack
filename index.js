import 'phaser';
import GameScene from './src/Scenes/GameScene';

const config = {
    type: Phaser.AUTO,

    width: 640,
    height: 480,
    backgroundColor: 0x000000,

    scene: [ GameScene ],

    parent: 'game-container'
};

const game = new Phaser.Game(config);
