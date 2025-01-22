import { Entity } from "../entity.js";
import { Game } from "../game.js";

export class BubbleHero extends Game {

    constructor(ctrl1, ctrl2) {
        super(new Player(ctrl1), new Player(ctrl2));
        this.bubbles1 = { tab: [], delay: 1000 };
        this.bubbles2 = { tab: [], delay: 1000 };

    }

    update(dt) {
        super.update(dt);

    }

    render(ctx) {
        super.render(ctx);

    }

}

class Player extends Entity {

}