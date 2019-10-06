import { Body } from "./Bodies/Body";

export class VerletEngine {

    private _timeBetweenSteps = 0;
    private _elapsedTimeSinceLastStep = 0;

    private _bodies: Body[] = [];

    public constructor(fixedFrameRate: number = 60) {
        this._timeBetweenSteps = (1.0 / fixedFrameRate) * 1000.0;
    }

    public get bodyCount(): number {
        return this._bodies.length;
    }

    public getBody(index: number): Body {
        return this._bodies[index];
    }

    public addBody(body: Body): void {
        if(this._bodies.indexOf(body) < 0) {
            body.engine = this;
            this._bodies.push(body);
        }
    }

    public removeBody(body: Body): void {
        const index = this._bodies.indexOf(body);
        if(index >= 0) {
            this._bodies.splice(index, 1);
        }
    }

    public update(deltaTime: number): void {
        this._elapsedTimeSinceLastStep += deltaTime;
        while(this._elapsedTimeSinceLastStep >= this._timeBetweenSteps) {
            this._step();
        }
    }

    private _step(): void {
        this._elapsedTimeSinceLastStep -= this._timeBetweenSteps;
        const fixedDeltaTimeInSecods = this._timeBetweenSteps / 1000.0;
        
        for(let i = this._bodies.length - 1; i >= 0; i--) {
            this._bodies[i].update(fixedDeltaTimeInSecods);
        }
    }
}
