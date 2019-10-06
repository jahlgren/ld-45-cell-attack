import { CellController } from "./CellController";
import Cell from "../Entities/Cell";
import { InputHelper } from "../Input/InputHelper";
import { Bullet } from "../Entities/Bullet";

export class PlayerController extends CellController {

    private _inputHelper: InputHelper;

    public constructor(scene: Phaser.Scene, cell: Cell, inputHelper: InputHelper) {
        super(scene, cell);
        this._inputHelper = inputHelper;
    }

    public update(deltaTime: number, bullets: Bullet[], cells: Cell[]): void {
        if(this._inputHelper.getPointerDown(1)) {
            this.cell.dash(this._inputHelper.pointerPosition.x, this._inputHelper.pointerPosition.y);
        }
        if(this._inputHelper.getPointerDown(0)) {
            this.cell.shoot();
        }

        this.cell.xTarget = this._inputHelper.pointerPosition.x;
        this.cell.yTarget = this._inputHelper.pointerPosition.y;

        this.cell.xAim = this._inputHelper.pointerPosition.x;
        this.cell.yAim = this._inputHelper.pointerPosition.y;
    }
}
