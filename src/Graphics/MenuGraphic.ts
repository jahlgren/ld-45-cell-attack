import { PulsatingText } from "./PulsatingText";

export class MenuGraphic extends Phaser.GameObjects.Container {

    private _title: Phaser.GameObjects.Text;
    private _subTitle: Phaser.GameObjects.Text;
    private _footer: Phaser.GameObjects.Text;

    private _info: PulsatingText;

    private _fadeOutTimer: number = -1;

    public constructor(scene: Phaser.Scene) {
        super(scene, scene.game.canvas.width / 2, scene.game.canvas.height / 2);
        this.scene.add.existing(this);    

        this._title = this.scene.add.text(
            0, 0, 'super cell attack',
            {
                fontSize: 72,
                fontFamily: "'Gochi Hand', Arial",
            }
        );
        
        this._title.x -= this._title.width / 2;
        this._title.y -= 180;

        this.add(this._title);


        this._subTitle = this.scene.add.text(
            0, 0, 'ludumdare 45 ( start with nothing! )',
            {
                fontSize: 30,
                fontFamily: "'Gochi Hand', Arial",
                color: '#ff1155'
            }
        );
        this._subTitle.x -= this._subTitle.width / 2;
        this._subTitle.y -= 100;

        this.add(this._subTitle);


        this._footer = this.scene.add.text(
            0, 0, 'a game by Jimi Ahlgren',
            {
                fontSize: 30,
                fontFamily: "'Gochi Hand', Arial",
                color: '#ffffff'
            }
        );
        this._footer.x -= this._footer.width / 2;
        this._footer.y += 120;

        this.add(this._footer);
        this._footer.alpha = 0.75;

        this._info = new PulsatingText(scene, 0, 24,
            '( use your mouse )', 30);

        this.add(this._info);
    }

    public preUpdate(elapsed: number, delta: number) {

        let alpha = 1;

        if(this._fadeOutTimer > 0) {
            this._fadeOutTimer -= (delta / 1000.0) * 4;
            alpha = this._fadeOutTimer;

            if(this._fadeOutTimer <= 0) {
                this.destroy();
            }
        }

        this._title.alpha = alpha;
        this._subTitle.alpha = alpha;
        this._info.alpha = alpha;
        this._footer.alpha = alpha * 0.5;
    }

    public fadeOut(): void {
        this._fadeOutTimer = 1;
    }
}
