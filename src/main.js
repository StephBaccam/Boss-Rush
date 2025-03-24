import { Start } from './scenes/Start.js';
import { FirstLevel } from './scenes/first-level.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 800,
    height: 480,
    backgroundColor: '#000000',
    pixelArt: false,
    physics: { 
        default: 'arcade', 
        arcade: { 
            gravity: { y: 300 }, 
            debug: true 
        } 
    },
    scene: [
        FirstLevel
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            