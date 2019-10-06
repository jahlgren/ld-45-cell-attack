import { Point } from "../Point";
import { Constraint } from "./Constraint";

export class LineConstraint extends Constraint {

    public force: number = 1;

    public left: Point;
    public right: Point;

    public targetDistance: number;

    public constructor(left?: Point, right?: Point, targetDistance?: number) {
        super();
        if(left && right) {
            this.setPoints(left, right, targetDistance);
        }
    }

    public setPoints(left: Point, right: Point, targetDistance?: number): void {
        this.left = left;
        this.right = right;

        if(targetDistance) {
            this.targetDistance = targetDistance;
        } 
        else if(this.left && this.right) {
            const dx = this.left.x - this.right.x;
            const dy = this.left.y - this.right.y;
            this.targetDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }

    public update(fixedDeltaTimeInSecods: number): void {
        const dx = this.right.x - this.left.x;
        const dy = this.right.y - this.left.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const difference = this.targetDistance - distance;
        
        // The force is not delta time based...
        // However you can change the fixedFrameRate in VerletEngine.
        const xOff = (difference * dx / distance) * (this.force * 0.5);
        const yOff = (difference * dy / distance) * (this.force * 0.5);

        if(this.left.pinned == false) {
            this.left.x -= xOff;
            this.left.y -= yOff;
        }

        if(this.right.pinned == false) {
            this.right.x += xOff;
            this.right.y += yOff;
        }
    }
}
