import Cell from "../Entities/Cell";
import { Scene } from "phaser";
import { Bullet } from "../Entities/Bullet";

export abstract class CellController {
    public cell: Cell;
    public scene: Scene;

    public constructor(scene: Phaser.Scene, cell: Cell) {
        this.cell = cell;
        this.scene = scene;
    }

    public update(deltaTime: number, bullets: Bullet[], cells: Cell[]): void {

    }
}