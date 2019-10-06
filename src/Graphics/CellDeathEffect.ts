import 'phaser';
import Cell from '../Entities/Cell';
import { RopeBody } from '../Verlet/Bodies/RopeBody';
import { Point } from '../Verlet/Point';
import { VerletEngine } from '../Verlet/VerletEngine';

export class CellDeathEffect extends Phaser.GameObjects.Graphics {

    private _ropes: RopeBody[] = [];
    private _verletEngine: VerletEngine;

    private lineWidth = 0;
    private color = 0;

    private _circles: Phaser.Geom.Circle[] = [];
    private _circleVelocities: Phaser.Math.Vector2[] = [];

    private _timer = 5;

    public constructor(scene: Phaser.Scene, verletEngine: VerletEngine, cell: Cell) {
        super(scene);

        this.scene.add.existing(this);
        this._verletEngine = verletEngine;

        this.lineWidth = cell.lineWidth;
        this.color = cell.color;

        let i = 1;
        while(i < cell.body.pointCount) {
            const ropePointCount = Phaser.Math.Between(2, 12);
            const rope = new RopeBody();

            for(let j = i; j < i + ropePointCount; j++) {
                if(j >= cell.body.pointCount) {
                    break;
                }
                const cellPoint = cell.body.getPoint(j);
                rope.addPoint(new Point(cell.x + cellPoint.x, cell.y + cellPoint.y));
            }

            if(rope.pointCount > 1) {
                verletEngine.addBody(rope);
                this._ropes.push(rope);

                const ri = Math.random() < 0.5 ? 0 : rope.pointCount-1;
                rope.getPoint(ri).x += Phaser.Math.Between(-20, 20);
                rope.getPoint(ri).y += Phaser.Math.Between(-20, 20);
            } 

            i += ropePointCount - 1;
        }

        const bodyPartCount = Phaser.Math.Between(3, 5);
        for(let i = 0; i < bodyPartCount; i++) {
            const a = Phaser.Math.PI2 * Math.random();
            let rand = Math.random();
            const cos = Math.cos(a);    
            const sin = Math.sin(a);
            const circle = new Phaser.Geom.Circle(
                cell.x + cos * 5 * rand,
                cell.y + sin * 5 * rand,
                Phaser.Math.Between(5, cell.radius * 0.75));
            this._circles.push(circle);
            rand = Phaser.Math.Between(0, 250);
            this._circleVelocities.push(
                new Phaser.Math.Vector2(cos * rand, sin * rand)
            );
        }
    }

    public preUpdate(elapsed: number, deltaTime: number) {
        const deltaInSeconds: number = deltaTime / 1000.0;
        this._timer -= deltaInSeconds;

        if(this._timer < 0) {
            this.destroy();
            return;
        }

        this.clear();

        let alpha: number =  Math.max(0, Math.min(1.0, this._timer));
        alpha *= alpha * alpha;

        let point: Point;
        let rope: RopeBody;

        this.lineStyle(this.lineWidth, this.color, alpha);
        this.beginPath();
        for(let i = 0; i < this._ropes.length; i++) {
            rope = this._ropes[i];
            point = rope.getPoint(0);
            this.moveTo(point.x, point.y);
            for(let j = 1; j < rope.pointCount; j++) {
                point = rope.getPoint(j);
                this.lineTo(point.x, point.y);
            }
        }
        this.stroke();

        this.fillStyle(this.color, 0.25 * alpha);
        for(let i = 0; i < this._circles.length; i++) {
            this._circles[i].x += this._circleVelocities[i].x * deltaInSeconds;
            this._circles[i].y += this._circleVelocities[i].y * deltaInSeconds;

            this.fillCircle(
                this._circles[i].x,
                this._circles[i].y,
                this._circles[i].radius
            );

            const deltaDrag = 1.0 / (1.0 + deltaInSeconds * 3);
            this._circleVelocities[i].x *= deltaDrag;
            this._circleVelocities[i].y *= deltaDrag;
        }
    }
}
