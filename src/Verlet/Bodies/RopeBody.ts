import { Body } from "./Body";
import { Point } from "../Point";
import { LineConstraint } from "../Contraints/LineConstraint";

export class RopeBody extends Body {

    protected _lineConstraints: LineConstraint[] = [];
    protected _connectedConstraint: LineConstraint = new LineConstraint();

    public constructor() {
        super();
    }

    public addPoint(point: Point): void {
        super.addPoint(point);

        const pointCount = this._points.length;
        if(pointCount > 1) {
            const constraint = new LineConstraint(
                this._points[pointCount - 2],
                this._points[pointCount - 1]
            );
            this._lineConstraints.push(constraint);
            this.addConstraint(constraint);
            this._updateConnectedConstraint();
        }
    }

    public setConnected(connected: boolean): void {
        if(connected) {
            this._updateConnectedConstraint();
            this.addConstraint(this._connectedConstraint);
        } else {
            this.removeConstraint(this._connectedConstraint);
        }
    }

    // TODO: Handle removePoint(point)

    private _updateConnectedConstraint(): void {
        if(this._points.length > 1) {
            this._connectedConstraint.setPoints(this._points[this._points.length - 1], this._points[0]);
        }
    }
}
