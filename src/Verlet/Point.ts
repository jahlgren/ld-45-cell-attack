export class Point {

    public pinned: boolean = false;
    public drag: number = 0.01;

    public x: number;
    public y: number;

    private _xOld: number;
    private _yOld: number;

    public constructor(x: number, y: number) {
        this.set(x, y);
    }

    public set(x: number, y: number): void {
        this.x = this._xOld = x;
        this.y = this._yOld = y;
    }

    public update(fixedDeltaTimeInSecods: number): void {

        if(this.pinned) {
            this.x = this._xOld;
            this.y = this._yOld;
        }
        else {
            const xTemp = this.x;
            const yTemp = this.y;
            
            // The drag is not delta time based...
            // However you can change the fixedFrameRate in VerletEngine.
            let forceX = (this.x - this._xOld) * (1.0 - this.drag);
            let forceY = (this.y - this._yOld) * (1.0 - this.drag);

            if(forceX * forceX < 0.001) {
                forceX = 0;
            }

            if(forceY * forceY < 0.001) {
                forceY = 0;
            }

            this.x += forceX;
            this.y += forceY;

            this._xOld = xTemp;
            this._yOld = yTemp;
        }
    }
}
