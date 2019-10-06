import 'phaser';

export class ExplosionGraphic extends Phaser.GameObjects.Arc {

    private _timer: number;
    private _color: number;

    public constructor(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, duration: number = 0.2) {
        super(scene, x, y,
            radius, 0, 360, false,
            color, 1.0);

        this.scene.add.existing(this);

        this._color = color;
        this._timer = duration;
    }

    public preUpdate(elapsed: number, deltaTime: number): void {
        const deltaInSeconds = deltaTime / 1000;
        this._timer -= deltaInSeconds;

        if(Math.round(this._timer * 8) % 2 == 1) {
            this.fillColor = 0x000000;
        } else {
            this.fillColor = this._color;
        }

        if(this._timer <= 0) {
            this.destroy();
        }
    }
}