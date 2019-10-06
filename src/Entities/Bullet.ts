import 'phaser';
import Cell from './Cell';
import { CircleBurstGraphic } from '../Graphics/CircleBurstGraphic';
import { ExplosionGraphic } from '../Graphics/ExplosionGraphic';

export class Bullet extends Phaser.GameObjects.Container {

    public owner: Cell;
    public wasFiredBy: Cell;

    public velocity = new Phaser.Math.Vector2();
    public drag: number = 3;
    public speed = 1500;

    private _circle: Phaser.GameObjects.Arc;

    private _idleTimer: number = 0;

    private _dontHitOwnerTimer = 0;

    public constructor(scene: Phaser.Scene, x: number, y: number) {

        super(scene, x, y);
        scene.add.existing(this);

        this.depth = 1;

        this._circle = this.scene.add.circle(0, 0, 6, 0xeeeeee);
        this._circle.setOrigin(0.5, 0.5);
        this.add(this._circle);
    }

    public get radius(): number {
        if(this._circle != null) {
            return this._circle.radius * this.scale;
        } else {
            return 0;
        }
    }

    public isIdle(): boolean {
        return !this.hasOwner() && (this.wasFiredBy == undefined || this.wasFiredBy == null);
    }

    public hasOwner(): boolean {
        return this.owner != undefined && this.owner != null;
    }

    public gotOwner(owner: Cell): void {
        this.owner = owner;
    }

    public becameActiveInOwner(): void {
        this.scale = 1.5;
    }

    public canDamageCell(cell: Cell): boolean {
        if(this._dontHitOwnerTimer > 0 && (cell == this.owner || cell == this.wasFiredBy)) {
            return false;
        }
        return true;
    }

    public shoot(angle: number, speed: number = 1, drag: number = 3): void {
        this.velocity.x = Math.cos(angle) * this.speed * speed;
        this.velocity.y = Math.sin(angle) * this.speed * speed;
        this.wasFiredBy = this.owner;
        this.owner = null;
        this.scale = 2.5;
        this.drag = drag;
        this._dontHitOwnerTimer = 0.1;
    }

    public explode(): void {
        for(let i = 0; i < 3; i++) {
            const a = Phaser.Math.PI2 * Math.random();
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            const radius = Phaser.Math.Between(30, 60);
            const rp = Phaser.Math.Between(0, 30);
            const t = Phaser.Math.FloatBetween(0.1, 0.2);
            new ExplosionGraphic(this.scene, this.x + cos * rp, this.y + sin * rp, radius, this._circle.fillColor, t);
        }
    }

    public update(deltaTime: number): void {
        const deltaInSeconds = deltaTime / 1000.0;

        this._dontHitOwnerTimer -= deltaInSeconds;

        this._handleVelocity(deltaInSeconds);
        this._handleDrag(deltaInSeconds);

        if(this.wasFiredBy && (this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) < 300) {
            this.wasFiredBy = null;
            this._onBecameIdle();
        }

        if(this.isIdle()) {
            this._idleTimer -= deltaTime;
            if(this._idleTimer < 0) {
                const effect = new CircleBurstGraphic(this.scene, 0, 0, 50, 0xffffff, 0.33);
                effect.depth = -1;
                this.add(effect);
                this._idleTimer = 1000;
            }
        }
    }

    private _handleVelocity(deltaInSeconds: number): void {
        this.x += this.velocity.x * deltaInSeconds;
        this.y += this.velocity.y * deltaInSeconds;
    }

    private _handleDrag(deltaInSeconds: number): void {

        const deltaDrag = 1.0 / (1.0 + deltaInSeconds * this.drag);
        this.velocity.x *= deltaDrag;
        this.velocity.y *= deltaDrag;

        if(this.velocity.x * this.velocity.x < 0.001) {
            this.velocity.x = 0;
        }

        if(this.velocity.y * this.velocity.y < 0.001) {
            this.velocity.y = 0;
        }
    }

    private _onBecameIdle(): void {
        this.scale = 1;
        const effect = new CircleBurstGraphic(this.scene, 0, 0, 350, 0xffffff, 0.25, 8);
        effect.depth = -1;
        this.add(effect);
    }
}
