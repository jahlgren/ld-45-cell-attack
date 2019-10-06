import { Point } from "../Point";
import { Constraint } from "../Contraints/Constraint";
import { VerletEngine } from "../VerletEngine";


export class Body {
    
    public engine: VerletEngine;

    protected _points: Point[] = [];
    protected _constraints: Constraint[] = [];

    public update(fixedDeltaTimeInSecods: number): void {
        for(let i = this._points.length - 1; i >= 0; i--) {
            this._points[i].update(fixedDeltaTimeInSecods);
        }

        for(let i = this._constraints.length - 1; i >= 0; i--) {
            this._constraints[i].update(fixedDeltaTimeInSecods);
        }
    }

    public get pointCount(): number {
        return this._points.length;
    }

    public get constraintCount(): number {
        return this._constraints.length;
    }

    public destroy(): void {
        this.engine.removeBody(this);
    }

    public getPoint(index: number): Point {
        return this._points[index];
    }

    public addPoints(...points: Point[]): void {
        for(let i = 0; i < points.length; i++) {
            this.addPoint(points[i]);
        }
    }

    public addPoint(point: Point): void {
        if(this._points.indexOf(point) < 0) {
            this._points.push(point);
        }
    }

    public removePoint(point: Point): void {
        const index = this._points.indexOf(point);
        if(index >= 0) {
            this._points.splice(index, 1);
        }
    }

    public getConstraint(index: number): Constraint {
        return this._constraints[index];
    }

    public addConstraint(constraint: Constraint): void {
        if(this._constraints.indexOf(constraint) < 0) {
            this._constraints.push(constraint);
        }
    }

    public removeConstraint(constraint: Constraint): void {
        const index = this._constraints.indexOf(constraint);
        if(index >= 0) {
            this._constraints.splice(index, 1);
        }
    }

    public clearConstraints(): void {
        while(this._constraints.length > 0) {
            this._constraints.splice(0, 1);
        }
    }
}
