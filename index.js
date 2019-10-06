import 'phaser';
import GameScene from './src/Scenes/GameScene';

const config = {
    type: Phaser.AUTO,

    width: 800,
    height: 600,
    backgroundColor: 0x111111,

    audio: {
        disableWebAudio: true
    },
    
    scene: [ GameScene ],

    parent: 'game-container',
    disableContextMenu: true
};

WebFont.load({
    google: {families: [ 'Gochi Hand' ]},
    active: startGame,
    inactive: startGame
});

function startGame() {
    const game = new Phaser.Game(config);
}
