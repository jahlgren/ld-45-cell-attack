import { Body } from "./Body";
import { Point } from "../Point";
import { LineConstraint } from "../Contraints/LineConstraint";

export class CircleBody extends Body {

    private _dirty: boolean = false;

    public constructor(pointCount: number, radius: number, handleDirtyOnStart: boolean = true) {
        super();

        const middle = new Point(0, 0);
        middle.pinned = true;
        this.addPoint(middle);

        let a = 0, rx = 0, ry = 0;
        for(let i = 0; i < pointCount; i++) {
            a = i / pointCount * Phaser.Math.PI2;
            rx = Math.cos(a) * radius;
            ry = Math.sin(a) * radius;
            this.addPoint(new Point(rx, ry));
        }

        if(this._handleDirty) {
            this._handleDirty();
        }
    }

    public setRadius(radius: number): void {

        const middle = this._points.splice(0, 1)[0];

        let a = 0, rx = 0, ry = 0;
        for(let i = 0; i < this.pointCount; i++) {
            a = i / this.pointCount * Phaser.Math.PI2;
            rx = Math.cos(a) * radius;
            ry = Math.sin(a) * radius;
            this.getPoint(i).set(rx, ry);
        }

        this._points.unshift(middle);
        this._handleDirty();
    }

    public addPoint(point: Point): void {
        super.addPoint(point);
        this._dirty = true;
    }

    public update(fixedDeltaTime: number): void {
        super.update(fixedDeltaTime);

        if(this._dirty) {
            this._handleDirty();
        }
    }

    private _handleDirty(): void {

        this.clearConstraints();

        const middle = this._points.splice(0, 1)[0];
            
        let constraint: LineConstraint;
        for(let i = 0; i < this.pointCount; i++) {

            // Middle
            constraint = new LineConstraint( 
                middle,
                this._points[i % this.pointCount]
            );
            constraint.force = 0.1;
            this.addConstraint(constraint);

            for(let j = 1; j <= 4; j++) {
                // Neighbors
                constraint = new LineConstraint( 
                    this._points[i],
                    this._points[(i + j) % this.pointCount]
                );
                constraint.force = 0.04;
                this.addConstraint(constraint);
            }
        }

        this._points.unshift(middle);
        this._dirty = false;
    }
}
