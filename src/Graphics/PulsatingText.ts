export class PulsatingText extends Phaser.GameObjects.Container {
    
    public label: Phaser.GameObjects.Text;
    public timer: number = 1;
    
    public constructor(scene: Phaser.Scene, x: number, y: number, text: string, size: number) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.label = this.scene.add.text(
            0, 0, text,
            {
                fontSize: size,
                fontFamily: "'Gochi Hand', Arial",
                color: '#ffffff'
            }
        );
        this.label.x -= this.label.width / 2;
        this.label.y -= this.label.height / 2;
        this.add(this.label);
        this.label.alpha = 0;
    }

    public preUpdate(elapsed: number, delta: number): void {
        this.timer += delta;
        const sin = Math.sin(this.timer* 0.001);
        this.label.alpha = Math.abs(sin) * 0.5;
    }
}
