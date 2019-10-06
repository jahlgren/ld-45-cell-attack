export class EnemySpawner extends Phaser.GameObjects.Graphics {

    private _timer: number = 0;
    private _maxTime: number = 3;

    public constructor(scene: Phaser.Scene, x: number, y: number, maxTime: number = 3) {
        super(scene);
        this.x = x;
        this.y = y;
        this._maxTime = maxTime;

        scene.add.existing(this);
    }

    public hasFinished() {
        return this._timer > this._maxTime;
    }

    public preUpdate(elapsed: number, delta: number): void {
        this.clear();
        this._timer += delta / 1000;

        const timePercent = this._timer / this._maxTime;
        if(this.hasFinished()) {
            return;
        }


        const t = 1 + (this._timer * 4);
        const radius = 10 + Math.abs(Math.sin(t)) * 10;
        const radius2 = 5 + Math.abs(Math.sin(1 + t)) * 15;

        this.fillStyle(0xff0000, 0.33);
        this.fillCircle(0, 0, radius2);
        this.fillStyle(0xaa00ff, 0.33);
        this.fillCircle(0, 0, radius);

        this.lineStyle(10, 0xaa00ff, 0.66);
        this.beginPath();
        this.arc(0, 0, 25, -Phaser.Math.PI2/4, Phaser.Math.PI2 * timePercent - Phaser.Math.PI2/4);
        this.strokePath();
    }
}
