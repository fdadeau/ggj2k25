
import { Bubble, Entity } from "../entity.js";

const COLORS = {1: "#6f6fde", 2: "#de6fde" };

export class Player extends Entity {

    constructor(controls) {
        super(controls);
        this.bubble = new Bubble(200, 400, COLORS[1], 200);
    }

    update(dt) {
        this.bubble.update(dt);
    }

    render(ctx) {
        this.bubble.render(ctx);
    }

}