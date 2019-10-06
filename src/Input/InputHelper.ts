import 'phaser';

export class InputHelper {
    
    public pointerPosition = new Phaser.Math.Vector2();

    private _scene: Phaser.Scene;

    private _pointerButtonsDown: boolean[] = [false, false];
    private _pointerButtonsPreviousDown: boolean[] = [false, false];

    public constructor(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public getPointerDown(index: number): boolean {
        return this._pointerButtonsDown[index] && this._pointerButtonsPreviousDown[index] == false;
    }

    public update(): void {

        this.pointerPosition.x = this._scene.input.activePointer.x;
        this.pointerPosition.y = this._scene.input.activePointer.y;

        if(this.pointerPosition.x < 0 || this.pointerPosition.y < 0 || this.pointerPosition.x > this._scene.game.canvas.width || this.pointerPosition.y > this._scene.game.canvas.height) {
            this._pointerButtonsDown[0] = this._scene.input.activePointer.leftButtonDown();
            this._pointerButtonsDown[1] = this._scene.input.activePointer.rightButtonDown();
            this._pointerButtonsPreviousDown[0] = this._pointerButtonsDown[0];
            this._pointerButtonsPreviousDown[1] = this._pointerButtonsDown[1];
        }

        this._pointerButtonsPreviousDown[0] = this._pointerButtonsDown[0];
        this._pointerButtonsPreviousDown[1] = this._pointerButtonsDown[1];

        this._pointerButtonsDown[0] = this._scene.input.activePointer.leftButtonDown();
        this._pointerButtonsDown[1] = this._scene.input.activePointer.rightButtonDown();
    }
}
