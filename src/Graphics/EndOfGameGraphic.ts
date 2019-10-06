import { PulsatingText } from "./PulsatingText";

export class EndOfGameGraphic extends Phaser.GameObjects.Container {

    private _timer = 0;
    private _playAgainAdded = false;

    public constructor(scene: Phaser.Scene) {
        super(scene, scene.game.canvas.width/2, scene.game.canvas.height/2);
        scene.add.existing(this);

        const title = scene.add.text(
            0, 0, 'thank you for playing!',
            {
                fontSize: 72,
                fontFamily: "'Gochi Hand', Arial",
            }
        );
        this.add(title);
        title.x -= title.width/2;
        title.y -= 100;

        const subTitle = this.scene.add.text(
            0, -26, 'you completed the game :)',
            {
                fontSize: 30,
                fontFamily: "'Gochi Hand', Arial",
                color: '#ff1155'
            }
        );
        this.add(subTitle);
        subTitle.x -= subTitle.width/2;

        this.alpha = 0;
    }

    public canRestart(): boolean {
        return this._timer > 1.5;
    }

    public preUpdate(elapsed: number, delta: number): void {
        this._timer += delta / 1000;
        if(this._timer > 1.5) {
            if(this._playAgainAdded == false) {
                const restartText = new PulsatingText(this.scene, 0, 70, '( left click to play again )', 40);
                this.add(restartText);
                this._playAgainAdded = true;
            }
        }

        this.alpha = Math.min(1, this._timer * 4);
    }
}