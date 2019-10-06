import 'phaser';

import Cell from '../Entities/Cell';
import { VerletEngine } from '../Verlet/VerletEngine';
import { InputHelper } from '../Input/InputHelper';
import { Bullet } from '../Entities/Bullet';
import { CellController } from '../Controllers/CellController';
import { PlayerController } from '../Controllers/PlayerController';
import { AiController } from '../Controllers/AiController';
import { CircleBurstGraphic } from '../Graphics/CircleBurstGraphic';
import { ExplosionGraphic } from '../Graphics/ExplosionGraphic';
import { MenuGraphic } from '../Graphics/MenuGraphic';
import { PulsatingText } from '../Graphics/PulsatingText';
import { EnemySpawner } from '../Entities/EnemySpawner';
import { EndOfGameGraphic } from '../Graphics/EndOfGameGraphic';

export default class GameScene extends Phaser.Scene {

    private _bestScore: number = 0;

    private _inputHelper: InputHelper;
    private _verletEngine: VerletEngine;

    private _cellControllers: CellController[] = [];
    private _cells: Cell[] = [];
    private _bullets: Bullet[] = [];

    private _playerCell: Cell;
    private _enemies: Cell[] = [];
    private _enemySpawners: EnemySpawner[] = [];

    private _hasBeenSpawned: boolean = false;
    private _spawnStrength: number = 0;

    private _menuGraphic: MenuGraphic;

    private _infoLabelTimer: number = 0;
    private _infoStep: number = 0;
    private _infoLabel: PulsatingText;

    private _bulletSpawnTimer: number = 0;

    private _enemySpawnRate: number = 5;
    private _enemySpawnTimer: number = 0;

    private _score =0;
    private _killTarget = 51;

    private _scoreLabel: Phaser.GameObjects.Text;
    private _restartTimer = -1;
    private _restartLabel: PulsatingText;

    private _startDelay: number = 0;

    private _endOfGameTimer: number;
    private _endOfGameGraphic: EndOfGameGraphic;

    public constructor() {
        super({
            key: 'GameScene'
        });


    }

    public init() {
        this._inputHelper = null;
        this._verletEngine = null;
    
        this._cellControllers = [];
        this._cells = [];
        this._bullets = [];
    
        this._playerCell = null;
        this._enemies = [];
        this._enemySpawners = [];
    
        this._hasBeenSpawned = false;
        this._spawnStrength = 0;
    
        this._menuGraphic = null;
    
        this._infoLabelTimer = 0;
        this._infoLabel = null;
        this._infoStep = 0;
    
        this._bulletSpawnTimer = 0;
    
        this._enemySpawnRate = 3;
        this._enemySpawnTimer = this._enemySpawnRate;

        this._score = 0;
        this._scoreLabel = null;
        this._restartTimer = -1;
        this._restartLabel = null;

        this._startDelay = 0.1;

        this._endOfGameTimer = 0;
        this._endOfGameGraphic = null;
    }

    public preload() {
        this.load.audio('shoot-01', './assets/shoot-01.wav');
        this.load.audio('shoot-02', './assets/shoot-02.wav');
        this.load.audio('shoot-03', './assets/shoot-03.wav');

        this.load.audio('death-01', './assets/death-01.wav');
        this.load.audio('death-02', './assets/death-02.wav');
        this.load.audio('death-03', './assets/death-03.wav');

        this.load.audio('dash-01', './assets/dash-01.wav');
        this.load.audio('dash-02', './assets/dash-02.wav');
        this.load.audio('dash-03', './assets/dash-03.wav');

        this.load.audio('spawn-tick', './assets/spawn-tick.wav');
        this.load.audio('player-spawn-01', './assets/player-spawn-01.wav');
        this.load.audio('player-spawn-02', './assets/player-spawn-02.wav');
        
        this.load.audio('enemy-spawn', './assets/enemy-spawn.wav');
        
        this.load.audio('bullet-pickup', './assets/bullet-pickup.wav');
    }

    public create() {
        this.sound.add('shoot-01');
        this.sound.add('shoot-02');
        this.sound.add('shoot-03');

        this.sound.add('death-01');
        this.sound.add('death-02');
        this.sound.add('death-03');

        this.sound.add('dash-01');
        this.sound.add('dash-02');
        this.sound.add('dash-03');

        this.sound.add('spawn-tick');
        this.sound.add('player-spawn-01');
        this.sound.add('player-spawn-02');

        this.sound.add('enemy-spawn');

        this.sound.add('bullet-pickup');


        this._inputHelper = new InputHelper(this);
        this._verletEngine = new VerletEngine();

        this._menuGraphic = new MenuGraphic(this);

        this._scoreLabel = this.add.text(
            this.game.canvas.width / 2,
            10, 
            '50',
            {
                fontSize: 72,
                fontFamily: "'Gochi Hand', Arial",
                color: '#ffffff'
            }
        );
        this._scoreLabel.alpha = 0;
    }

    public addBullet(bullet: Bullet): void {
        if(this._bullets.indexOf(bullet) < 0) {
            this._bullets.push(bullet);
        }
    }

    public destroyBullet(bullet: Bullet): void {
        const index = this._bullets.indexOf(bullet);
        this._bullets.splice(index, 1);
        if(bullet.owner) {
            bullet.owner.removeBullet(bullet);
        }
        bullet.destroy();
    }

    public destroyCell(cell: Cell): void {

        if(cell == this._playerCell) {
            this._restartTimer = 1;
        }

        const enemyIndex = this._enemies.indexOf(cell);
        if(enemyIndex >= 0) {
            this._enemies.splice(enemyIndex, 1);
            this._enemyKilled();
        }

        for(let i = this._cellControllers.length - 1; i >= 0; i--) {
            if(this._cellControllers[i].cell == cell) {
                this._cellControllers.splice(i, 1);
            }
        }

        if(cell.bullets.length > 1) {
            this.addBullet(new Bullet(this, cell.x, cell.y));
        }

        const index = this._cells.indexOf(cell);
        this._cells.splice(index, 1);
        for(let i = cell.bullets.length - 1; i >= 0; i--) {
            this.destroyBullet(cell.bullets[i]);
        }
        cell.destroy();
    }

    private _enemyKilled(): void {
        this._score++;
        this._bestScore = Math.max(this._bestScore, this._score);

        this._scoreLabel.alpha = 0.5;
        this._scoreLabel.text = (this._killTarget - this._score).toString();
        this._scoreLabel.x = this.game.canvas.width / 2 - this._scoreLabel.width / 2;

        if(this._score > 6) {
            this._enemySpawnRate = 2;
        }
    }

    private _getEnemyMaxCount(): number {
        if(this._score < 2) {
            return 1;
        } else if(this._score < 5) {
            return 2;
        } else if(this._score < 9) {
            return 3;
        } else if(this._score < 20) {
            return 4;
        }
        return 6;
    }

    private _spawnPlayer(): void {
        this._hasBeenSpawned = true;
        this._playerCell = new Cell(this, this._verletEngine,
            this.game.canvas.width / 2, this.game.canvas.height / 2);

        this._cells.push(this._playerCell);
        this._cellControllers.push(new PlayerController(this, this._playerCell, this._inputHelper));
        this._playerCell.allowPlayBulletPickupSound = true;

        this._playerCell.bounce(9);

        if(this._bestScore > 0) {
            this._playerCell.hasDashed = true;
            this._playerCell.hasShooted = true;
            this._bulletSpawnTimer = 1;
        } else {
            this._bulletSpawnTimer = 5;
        }

        this.sound.play('player-spawn-01');
        this.sound.play('player-spawn-02');
    }

    private _createInfoDash(): void {
        if(this._infoLabel) {
            this._infoLabel.destroy();
            this._infoLabel = null;
        }
        this._infoLabel = new PulsatingText(this, this.game.canvas.width/2, 100, '( right click to dash )', 40);
    }

    private _createInfoShoot(): void {
        if(this._infoLabel) {
            this._infoLabel.destroy();
            this._infoLabel = null;
        }
        this._infoLabel = new PulsatingText(this, this.game.canvas.width/2, 100, '( left click to shoot )', 40);
    }

    private _spawnEnemy(x: number, y: number): void {
        if(!this._playerCell) {
            return;
        }

        const speedy = this._score < 5 ? false : Math.random() < 0.33;
        const color = speedy ? 0xffff00 : 0xff1155;

        const enemy = new Cell(this, this._verletEngine, x, y, color);
        if(speedy) {
            enemy.acceleration *= 5;
            enemy.setBaseRadius(12);
        }
        enemy.shootSpeed = 0.5;
        enemy.bulletDrag = 2;
        this._enemies.push(enemy);
        this._cells.push(enemy);
        const controller = new AiController(this, enemy, this._playerCell);
        this._cellControllers.push(controller);

        if(this._score < 2) {
            controller.allowBulletSearch = false;
        }

        const bulletCount = this._score < 2 ? 0 : 1 + (!speedy ? Phaser.Math.Between(0, 2) : 0);
        for(let i = 0; i < bulletCount; i++) {
            const bullet = new Bullet(this, x, y);
            this.addBullet(bullet);
            enemy.addBullet(bullet);
        }

        new ExplosionGraphic(this, x, y, 25, 0xff1155, 0.3);

        this.sound.play('enemy-spawn');
    }

    public update(elapsedTime: number, deltaTime: number): void {
        const deltaTimeInSeconds = deltaTime / 1000.0;

        this._inputHelper.update();

        if(this._startDelay > 0) {
            this._startDelay -= deltaTimeInSeconds;
            return;
        }

        if(this._inputHelper.getPointerDown(0) && this._restartLabel) {
            this.scene.restart();
            return;
        }

        if(this._score >= this._killTarget) {
            this._endOfGameTimer += deltaTimeInSeconds;
            if(this._endOfGameTimer > 1 && !this._endOfGameGraphic) {
                this._endOfGameGraphic = new EndOfGameGraphic(this);
            }

            if(this._endOfGameGraphic && this._endOfGameGraphic.canRestart() && this._inputHelper.getPointerDown(0)) {
                this.scene.restart();
                return;
            }
        }

        if(this._restartTimer > 0) {
            this._restartTimer -= deltaTimeInSeconds;
            if(this._restartTimer <= 0) {
                this._restartLabel = new PulsatingText(
                    this, this.game.canvas.width / 2, this.game.canvas.height / 2 - 5,
                    '( left click to restart )',
                    40
                );
            }
        }

        if(this._infoLabel) {
            if(this._playerCell.hasShooted && this._playerCell.hasDashed) {
                this._infoLabel.destroy();
                this._infoLabel = null;
            }
            
            if(this._infoStep == 1 && this._playerCell.hasDashed) {
                this._infoLabel.destroy();
                this._infoLabel = null;
                this._infoLabelTimer = 2;
            }
        }

        if(this._infoLabelTimer > 0) {
            this._infoLabelTimer -= deltaTimeInSeconds;
            if(this._infoLabelTimer <= 0) {
                if(this._playerCell.hasDashed == false) {
                    this._createInfoDash();
                    console.log('dash tutorial');
                    this._infoStep = 1;
                }
                else if(this._playerCell.bullets.length < 1 && this._playerCell.hasShooted == false) {
                    this._infoLabelTimer = 0.1;
                }
                else if(this._playerCell.hasShooted == false) {
                    this._createInfoShoot();
                    console.log('shoot tutorial');
                    this._infoStep = 2;
                }
            }
        }

        if(this._hasBeenSpawned == false) {
            this._spawnStrength = Math.max(0, this._spawnStrength - deltaTimeInSeconds);
            if(this._inputHelper.getPointerDown(0)) {
                new CircleBurstGraphic(this, this.game.canvas.width / 2, this.game.canvas.height / 2,
                    100 + this._spawnStrength * 1000,
                    0xffffff, 0.5, 4);

                this._spawnStrength += 1;

                this.sound.play('spawn-tick');

                if(this._menuGraphic) {
                    this._menuGraphic.fadeOut();
                    this._menuGraphic = null;
                }

                if(this._spawnStrength > 2) {
                    this._spawnPlayer();
                    this._infoLabelTimer = 3;

                    new ExplosionGraphic(this, this.game.canvas.width / 2, this.game.canvas.height / 2,
                        400, 0xffffff, 0.35);

                    new ExplosionGraphic(this, this.game.canvas.width / 2, this.game.canvas.height / 2,
                        200, 0xff1155, 0.15);
                }
            }
            return;
        }

        if(this._playerCell) {
            this._bulletSpawnTimer -= deltaTimeInSeconds;
            if(this._bulletSpawnTimer < 0) {
                this._bulletSpawnTimer = 5;
                if(this._bullets.length < 3) {
                    this.addBullet(new Bullet(this,
                        Phaser.Math.Between(20, this.game.canvas.width - 20),
                        Phaser.Math.Between(20, this.game.canvas.height - 20)
                    ));
                }
            }

            // Spawn enemies..
            if(this._playerCell.hasDashed && this._playerCell.hasShooted) {
                this._enemySpawnTimer -= deltaTimeInSeconds;
                const enemyConut = this._enemies.length + this._enemySpawners.length;
                if(this._enemySpawnTimer < 0 && this._score + enemyConut < this._killTarget) {
                    if(enemyConut < this._getEnemyMaxCount()) {
                        this._enemySpawnTimer = this._enemySpawnRate;

                        const spawner = new EnemySpawner(this,
                            Phaser.Math.Between(40, this.game.canvas.width-40),
                            Phaser.Math.Between(40, this.game.canvas.height-40),
                            this._score > 10 ? 2 : 3
                        );

                        this._enemySpawners.push(spawner);
                    }
                }
            }
        }

        for(let i = this._enemySpawners.length-1; i>=0; i--) {
            if(this._enemySpawners[i].hasFinished()) {
                this._spawnEnemy(this._enemySpawners[i].x, this._enemySpawners[i].y);
                this._enemySpawners[i].destroy();
                this._enemySpawners.splice(i, 1);
            }
        }
        
        for(let i = 0; i < this._cellControllers.length; i++) {
            this._cellControllers[i].update(deltaTime, this._bullets, this._cells);
        }

        let cell: Cell;
        for(let i = 0; i < this._cells.length; i++) {
            cell = this._cells[i];
            const outOfBoundsX = this.isOutOfBoundsX(cell.x, 0);
            if(outOfBoundsX) {
                cell.velocity.x = outOfBoundsX * Math.abs(cell.velocity.x);
            }
            const outOfBoundsY = this.isOutOfBoundsY(cell.y, 0);
            if(outOfBoundsY) {
                cell.velocity.y = outOfBoundsY * Math.abs(cell.velocity.y);
            }
            this._cells[i].update(deltaTime);
        }
        
        let distanceToCell = 0, attractRadius = 100, attractStrength = 100, attractForce = 0, angleToCell = 0;
        let bullet: Bullet;
        for(let i = this._bullets.length - 1; i >= 0; i--) {
            bullet = this._bullets[i];

            if(!bullet) {
                continue;
            }

            // Attract towards cells..
            /*
            if(bullet.hasOwner() == false) {
                for(let j = this._cells.length - 1; j >= 0; j--) {
                    cell = this._cells[j];
                    distanceToCell = Phaser.Math.Distance.Between(bullet.x, bullet.y, cell.x, cell.y);
                    if(distanceToCell < cell.radius + attractRadius) {
                        attractForce = (attractStrength * (1.0 - (distanceToCell / (cell.radius + attractRadius)))) * deltaTimeInSeconds;
                        angleToCell = Phaser.Math.Angle.Between(bullet.x, bullet.y, cell.x, cell.y);
                        bullet.x += Math.cos(angleToCell) * attractForce;
                        bullet.y += Math.sin(angleToCell) * attractForce;

                        // Add bullet to cell.
                        if(bullet.isIdle()) {
                            if(cell.overlapPoint(bullet.x, bullet.y)) {
                                cell.addBullet(bullet);
                            }
                        } else {
                            // Check if bullet hits cell.
                            if(bullet && cell.intersectsCircle(bullet.x, bullet.y, bullet.radius)) {
                                if(bullet.canDamageCell(cell)) {
                                    bullet.explode();
                                    this.destroyBullet(bullet);
                                    bullet = null;

                                    cell.takeDamage();
                                    this.destroyCell(cell);
                                    break;
                                }
                            }
                        } 
                    }
                }
            }
            */

            // Attract towards cells..
            for(let j = this._cells.length - 1; j >= 0; j--) {
                cell = this._cells[j];
                distanceToCell = Phaser.Math.Distance.Between(bullet.x, bullet.y, cell.x, cell.y);
                if(distanceToCell < cell.radius + attractRadius) {
                    if(bullet.isIdle()) {
                        attractForce = (attractStrength * (1.0 - (distanceToCell / (cell.radius + attractRadius)))) * deltaTimeInSeconds;
                        angleToCell = Phaser.Math.Angle.Between(bullet.x, bullet.y, cell.x, cell.y);
                        bullet.x += Math.cos(angleToCell) * attractForce;
                        bullet.y += Math.sin(angleToCell) * attractForce;
                        
                        if(cell.overlapPoint(bullet.x, bullet.y)) {
                            cell.addBullet(bullet);
                            break;
                        }
                    }
                    else {
                        if(bullet.owner != cell) {
                            if(cell.intersectsCircle(bullet.x, bullet.y, bullet.radius)) {
                                if(bullet.canDamageCell(cell)) {
                                    bullet.explode();
                                    this.destroyBullet(bullet);
                                    bullet = null;

                                    cell.takeDamage();
                                    this.destroyCell(cell);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if(!bullet) {
                continue;
            }

            bullet.update(deltaTime);

            const outOfBoundsX = this.isOutOfBoundsX(bullet.x, 0);
            if(outOfBoundsX != 0) {
                bullet.velocity.x = outOfBoundsX * Math.abs(bullet.velocity.x);
            }

            const outOfBoundsY = this.isOutOfBoundsY(bullet.y, 0);
            if(outOfBoundsY != 0) {
                bullet.velocity.y = outOfBoundsY * Math.abs(bullet.velocity.y);
            }
        }

        this._verletEngine.update(deltaTime);
    }

    public isOutOfBoundsX(x: number, padding: number = 20): number {
        return x < padding ? 1 : x > this.game.canvas.width - padding ? -1 : 0;
    }

    public isOutOfBoundsY(y: number, padding: number): number {
        return y < padding ? 1 : y > this.game.canvas.height - padding ? -1 : 0;
    }
}
