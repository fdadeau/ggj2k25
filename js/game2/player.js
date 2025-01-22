
import { BubbleFactory, Bubble } from "./bubble.js";

import { Entity } from "../entity.js";


export class Player extends Entity {

    constructor(controls, color, x) {
        super();
        this.controls = controls;
        this.creator  = new BubbleFactory(x, 400, 15, 10, color);
        this.bubbles = [];
        this.blowing = false;
    }

    update(dt) {
        this.bubbles.forEach(b => b.update(dt));
    }

    render(ctx) {
        this.creator.render(ctx);
        this.bubbles.forEach(b => b.render(ctx));
    }

    keydown(e) {
        if (!this.blowing && e.code === this.controls.right) {
            this.blowing = true;
            if (this.bubbles[0] && this.bubbles[0].isDecreasing()) {
                this.bubbles[0].grow();
            }
            else 
                this.bubbles.unshift(this.creator.makeBubble());
        }
    }
    keyup(e) {
        if (this.blowing && e.code === this.controls.right) {
            this.bubbles[0] && this.bubbles[0].isGrowing() && this.bubbles[0].stop();
            this.blowing = false;
        }
    }


}