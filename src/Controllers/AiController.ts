import { CellController } from "./CellController";
import Cell from "../Entities/Cell";
import { InputHelper } from "../Input/InputHelper";
import { Bullet } from "../Entities/Bullet";

export class AiController extends CellController {

    public allowBulletSearch = true;
    private _target: Cell;

    private _newAimTimer: number = 0;
    private _newRandomAimTimer: number = 0;
    private _randomAimDirectionX = 0;
    private _randomAimDirectionY = 0;

    private _shootCooldownMax: number = 7;
    private _shootTimer: number = 0;

    private _dashTimer = 1;

    public constructor(scene: Phaser.Scene, cell: Cell, target: Cell) {
        super(scene, cell);
        this._target = target;

        this.cell.xTarget = Phaser.Math.Between(0, this.scene.game.canvas.width);
        this.cell.yTarget = Phaser.Math.Between(0, this.scene.game.canvas.height);

        this._shootTimer = Phaser.Math.Between(2, this._shootCooldownMax);
    }

    public update(deltaTime: number, bullets: Bullet[], cells: Cell[]): void {
        const deltaTimeInSeconds = deltaTime / 1000.0;

        this._newAimTimer -= deltaTimeInSeconds;
        this._newRandomAimTimer -= deltaTimeInSeconds;

        this._dashTimer -= deltaTimeInSeconds;
        if(this._dashTimer < 0) {
            if(Math.random() < 0.1) {
                this.cell.dash(this.cell.x + Phaser.Math.Between(-1, 1), this.cell.y + Phaser.Math.Between(-1, 1));
            }
            this._dashTimer = 1;
        }

        if(this.allowBulletSearch) {
            let closestBullet: Bullet = null;
            let distanceToClosestBullet = 99999;
            for(let i = 0; i < bullets.length; i++) {
                if(bullets[i].isIdle() == false) {
                    continue;
                }
                const distance = Phaser.Math.Distance.Between(this.cell.x, this.cell.y, bullets[i].x, bullets[i].y);
                if(distance < distanceToClosestBullet) {
                    closestBullet = bullets[i];
                    distanceToClosestBullet = distance;
                }
            }

            if(closestBullet && distanceToClosestBullet < 300) {
                this.cell.xTarget = closestBullet.x;
                this.cell.yTarget = closestBullet.y;
            }
        }

        if(this._newRandomAimTimer < 0) {
            this._newRandomAimTimer = Phaser.Math.Between(0, 2);
            this._randomAimDirectionX = Math.random() < 0.5 ? -1: 1;
            this._randomAimDirectionY = Math.random() < 0.5 ? -1: 1;

            this.cell.xTarget = Phaser.Math.Between(0, this.scene.game.canvas.width);
            this.cell.yTarget = Phaser.Math.Between(0, this.scene.game.canvas.height);
        }

        if(this._newAimTimer < 0) {
            this._newAimTimer = Phaser.Math.Between(0, 10);
            this.cell.xAim = this._target.x;
            this.cell.yAim = this._target.y;
        } else {
            this.cell.xAim += this._randomAimDirectionX * deltaTimeInSeconds * 100;
            this.cell.yAim += this._randomAimDirectionY * deltaTimeInSeconds * 100;
        }

        this._shootTimer -= deltaTimeInSeconds;
        if(this._shootTimer < 2) {
            this.cell.xAim = this._target.x;
            this.cell.yAim = this._target.y;
            if(this._shootTimer < 0) {
                this.cell.shoot();
                this._shootTimer = Phaser.Math.FloatBetween(0.5, this._shootCooldownMax);  
            }
        }
    }
}
