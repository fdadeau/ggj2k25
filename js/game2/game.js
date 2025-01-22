
import { WIDTH } from "../app.js";
import { Game } from "../game.js";

import { Player } from "./player.js";

const COLOR1 = { border: 'rgba(0, 191, 255, 0.8)', content: 'rgba(173, 216, 230, 0.7)' }
const COLOR2 = { border: 'rgba(255, 191, 255, 0.8)', content: 'rgba(255, 216, 230, 0.7)' }


export class Chifoumi extends Game {

    constructor(ctrl1, ctrl2) {
        super(new Player(ctrl1, COLOR1, 100), new Player(ctrl2, COLOR2, WIDTH - 100));
    }

    update(dt) {
        // propagate to players
        super.update(dt);
    }

    render(ctx) {
        // propagate to players
        super.render(ctx);
    }

}