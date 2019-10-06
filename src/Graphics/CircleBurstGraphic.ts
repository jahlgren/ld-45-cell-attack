import 'phaser';

export class CircleBurstGraphic extends Phaser.GameObjects.Arc {

    private _drag: number;
    private _speed: number;

    public constructor(scene: Phaser.Scene, x: number, y: number, speed: number, color: number, alpha: number, drag: number = 2.5) {
        super(scene, x, y,
            0, 0, 360, false,
            color, alpha);

        this.scene.add.existing(this);

        this._speed = speed;
        this._drag = drag;
    }

    public preUpdate(elapsed: number, deltaTime: number): void {
        const deltaInSeconds = deltaTime / 1000;
        this.radius += this._speed * deltaInSeconds;

        const deltaDrag = 1.0 / (1.0 + deltaInSeconds * this._drag);

        this._speed *= deltaDrag;

        this.alpha = Math.max(0, Math.min(1, this._speed / 25));

        if(this.alpha <= 0.01) {
            this.destroy();
        }
    }
}