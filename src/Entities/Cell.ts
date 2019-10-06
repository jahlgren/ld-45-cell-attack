import 'phaser';

import PhaserPoint = Phaser.Geom.Point;
import Vector2 = Phaser.Math.Vector2;
import Polygon = Phaser.Geom.Polygon;

import { VerletEngine } from '../Verlet/VerletEngine';
import { Point as VerletPoint } from '../Verlet/Point';
import { CircleBody } from '../Verlet/Bodies/CircleBody';
import { LineConstraint } from '../Verlet/Contraints/LineConstraint';
import { Bullet } from './Bullet';
import { CellDeathEffect } from '../Graphics/CellDeathEffect';

const MIN_RADIUS = 18;
const RADIUS_PER_BULLET = 3;

export default class Cell extends Phaser.GameObjects.Graphics {
    
    public allowPlayBulletPickupSound: boolean = false;

    public shootSpeed: number = 1;
    public bulletDrag: number = 3;
    public baseRadius = MIN_RADIUS;

    public hasDashed: boolean = false;
    public hasShooted: boolean = false;

    public lineWidth = 5;

    public acceleration = 60;
    public drag: number = 1;
    public dashSpeed = 300;
    
    public color: number = 0xffffff;
    
    public velocity: Vector2 = new Vector2(0, 0);

    public xTarget: number = 0;
    public yTarget: number = 0;

    public xAim: number = 0;
    public yAim: number = 0;
    
    public body: CircleBody;
    public bullets: Bullet[] = [];

    private _verletEngine: VerletEngine;
    private _radius: number = MIN_RADIUS;

    private _polygon: Polygon;

    private _activeBullet: Bullet = null;
    private _bulletRotationTimer: number = 0;
    private _bulletRotationSpeed: number = 1;

    private _aliveTickAnimationTimer = 0;

    private _shootSfxs: string[] = ['shoot-01', 'shoot-02', 'shoot-03'];
    private _dieSfxs: string[] = ['death-01', 'death-02', 'death-03' ];
    private _dashSfxs: string[] = ['dash-01', 'dash-02', 'dash-03' ];

    public constructor(scene: Phaser.Scene, verletEngine: VerletEngine, x: number, y: number, color: number = 0xffffff) {
        super(scene)
        
        this._verletEngine = verletEngine;
        this.x = this.xTarget = x;
        this.y = this.yTarget = y;
        this.color = color;

        scene.add.existing(this);

        this._polygon = new Polygon();
        this.body = new CircleBody(16, this._radius);
        this._verletEngine.addBody(this.body);
    }

    public get radius(): number {
        return this._radius;
    }

    public setBaseRadius(radius: number): void {
        this.baseRadius = radius;
        this.setRadius(this.baseRadius);
    }

    public setRadius(radius: number): void {
        this._radius = radius;
        this.body.setRadius(radius);
    }

    public overlapPoint(x: number, y: number): boolean {
        return this._polygon.contains(x - this.x, y - this.y);
    }

    public intersectsCircle(x:number, y:number, radius: number): boolean {
        
        let line = new Phaser.Geom.Line();
        let circle = new Phaser.Geom.Circle(x, y, radius);
        let point: Phaser.Geom.Point;
        for(let i = 1; i < this._polygon.points.length; i++) {
            point = this._polygon.points[i-1];
            line.x1 = this.x + point.x;
            line.y1 = this.y + point.y;
            point = this._polygon.points[i];
            line.x2 = this.x + point.x;
            line.y2 = this.y + point.y;

            if(Phaser.Geom.Intersects.LineToCircle(line, circle)) {
                return true;
            }
        }

        return false;
    }

    public takeDamage(): void {
        
        const deathEffect = new CellDeathEffect(this.scene, this._verletEngine, this);
        this.scene.sound.play(this._dieSfxs[Phaser.Math.Between(0, this._dieSfxs.length - 1)]);

    }

    public dash(towardsX: number, towardsY: number): void {
        this.hasDashed = true;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, towardsX, towardsY);
        const force: Vector2 = new Vector2(
            Math.cos(angle) * this.dashSpeed, 
            Math.sin(angle) * this.dashSpeed
        );

        this.velocity.x = force.x;
        this.velocity.y = force.y;

        force.normalize();
        let vector: Vector2 = new Vector2();
        for(let i = this.body.pointCount-1; i>=0; i--) {
            vector.x = this.body.getPoint(i).x;
            vector.y = this.body.getPoint(i).y;
            vector.normalize();
            const dot = vector.dot(force);
            this.body.getPoint(i).x += (force.x * 5) * (dot > 0 ? dot : -dot * dot * dot * dot);
            this.body.getPoint(i).y += (force.y * 5) * (dot > 0 ? dot : -dot * dot * dot * dot);
        }

        this.scene.sound.play(this._dashSfxs[ Phaser.Math.Between(0, this._dashSfxs.length - 1) ]);
    }

    public bounce(force: number): void {
        let vector: Vector2 = new Vector2();
        for(let i = this.body.pointCount-1; i>=0; i--) {
            vector.x = this.body.getPoint(i).x;
            vector.y = this.body.getPoint(i).y;
            vector.normalize();
            this.body.getPoint(i).x += vector.x * force * (0.25 + Math.random() * 0.75);
            this.body.getPoint(i).y += vector.y * force * (0.25 + Math.random() * 0.75);
        }
    }
    
    public addBullet(bullet: Bullet): void {
        if(this.allowPlayBulletPickupSound) {
            this.scene.sound.play('bullet-pickup');
        }

        if(this.bullets.indexOf(bullet) < 0) {
            bullet.gotOwner(this);
            this.bullets.push(bullet);
            this.setRadius(this.baseRadius + RADIUS_PER_BULLET * this.bullets.length);
            this.bounce(this._radius * 0.2);

            if(!this._activeBullet) {
                this._activeBullet = this.bullets[0];
                this._activeBullet.becameActiveInOwner();
            }
        }
    }

    public removeBullet(bullet: Bullet): void {
        const index = this.bullets.indexOf(bullet);
        if(index >= 0) {
            this.bullets.splice(index, 1);

            this.setRadius(this.baseRadius + RADIUS_PER_BULLET * this.bullets.length);
            this.bounce(this._radius * 0.2);

            if(index == 0) {
                this._activeBullet = this.bullets[0];
                if(this._activeBullet) {
                    this._activeBullet.becameActiveInOwner();
                }
            }
        }
    }

    public shoot(): void {
        if(!this._activeBullet) {
            return;
        }
        this.hasShooted = true;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.xAim, this.yAim);
        
        this._activeBullet.shoot(angle, this.shootSpeed, this.bulletDrag);
        const index = this.bullets.indexOf(this._activeBullet);
        this.bullets.splice(index, 1);
        
        this._activeBullet = this.bullets[0];
        if(this._activeBullet) {
            this._activeBullet.becameActiveInOwner();
        }

        this.setRadius(this.baseRadius + RADIUS_PER_BULLET * this.bullets.length);
        this.bounce(this._radius * 0.2);

        this.scene.sound.play(this._shootSfxs[ Phaser.Math.Between(0, this._shootSfxs.length - 1) ]);
    }

    public update(deltaTime: number): void {

        const deltaInSeconds = deltaTime / 1000.0;
        
        this._moveTowardsTarget(deltaInSeconds);
        
        this._handleVelocity(deltaInSeconds);
        this._handleDrag(deltaInSeconds);

        this._updateBulletPositions(deltaInSeconds);

        this._handleAliveTickAnimation(deltaTime);

        this._syncPoints();
        this._draw();
    }

    private _updateBulletPositions(deltaTimeInSeconds: number): void {
        if(this._polygon.points.length < 1) {
            return;
        }

        const centroid = Phaser.Geom.Point.GetCentroid(this._polygon.points);

        this._bulletRotationTimer += this._bulletRotationSpeed * deltaTimeInSeconds;

        let bullet: Bullet;
        let a = 0, dx = 0, dy = 0;
        let bulletCount = this.bullets.length;
        for(let i = 1; i < bulletCount; i++) {
            if(i >= this.bullets.length) {
                break;
            }

            bullet = this.bullets[i];
            a = i / (bulletCount - 1) *  Phaser.Math.PI2 + this._bulletRotationTimer;
            dx = (this.x + centroid.x) - (bullet.x + Math.cos(a) * 2 * (bulletCount - 1));
            dy = (this.y + centroid.y) - (bullet.y + Math.sin(a) * 2 * (bulletCount - 1));
            bullet.x += dx * deltaTimeInSeconds * 14;
            bullet.y += dy * deltaTimeInSeconds * 14;
        }

        if(this._activeBullet != null) {
            const angleToAim = Phaser.Math.Angle.Between(this.x, this.y, this.xAim, this.yAim);
            dx = (this.x + centroid.x) - (this._activeBullet.x - Math.cos(angleToAim) * (this._radius));
            dy = (this.y + centroid.y) - (this._activeBullet.y - Math.sin(angleToAim) * (this._radius));
            this._activeBullet.x += dx * deltaTimeInSeconds * 20;
            this._activeBullet.y += dy * deltaTimeInSeconds * 20;
        }
    }

    private _handleAliveTickAnimation(deltaTime): void {
        this._aliveTickAnimationTimer -= deltaTime;
        if(this._aliveTickAnimationTimer < 0) {
            const point = this.body.getPoint(Phaser.Math.Between(0, this.body.pointCount-1));
            const amount = this._radius * 0.025;
            point.x += amount * Math.sign(Math.random() - 0.5);
            point.y += amount * Math.sign(Math.random() - 0.5);

            this._aliveTickAnimationTimer = Phaser.Math.Between(10, 2000);

        }
    }

    private _moveTowardsTarget(deltaInSeconds: number): void {
        const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, this.xTarget, this.yTarget);

        this.velocity.x += Math.cos(angleToTarget) * this.acceleration * deltaInSeconds;
        this.velocity.y += Math.sin(angleToTarget) * this.acceleration * deltaInSeconds;
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

    private _draw(): void {
        this.clear();
        
        this.lineStyle(this.lineWidth, this.color, 1.0);
        this.fillStyle(this.color, 0.25);
        
        this.fillPoints(this._polygon.points, true, true);
        this.strokePoints(this._polygon.points, true, true);

        //this._debugDrawConstraints();
    }

    private _syncPoints(): void {
        // One less because circle body has one middle point.
        const pointCount = this.body.pointCount - 1;
        
        // Sync point count.
        while(this._polygon.points.length !== pointCount) {
            if(this._polygon.points.length > pointCount) {
                this._polygon.points.splice(0, 1);    
            } else {
                this._polygon.points.push(new PhaserPoint());
            }
        }

        // Sync positions..
        let point: VerletPoint;
        for(let i = 1; i <= pointCount; i++) {
            point = this.body.getPoint(i);
            this._polygon.points[i - 1].setTo(point.x, point.y);
        }
    }

    private _debugDrawConstraints(): void {
        this.lineStyle(1, 0xFFFF00, 1);
        this.beginPath();
        for(let i = 0; i < this.body.constraintCount; i++) {
            const constraint = (<LineConstraint>this.body.getConstraint(i));
            this.moveTo(constraint.right.x, constraint.right.y);
            this.lineTo(constraint.left.x, constraint.left.y);
        }
        this.stroke();
    }
}
