/**
 * Game class (abstract class)
 */

import { HEIGHT, WIDTH } from "./app.js";

export class Game {

    /**
     * 
     * @param {Player} player1 
     * @param {Player} player2 
     */
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
    }

    /**
     * Update of the game
     * @param {number} dt elapsed time since last update
     */
    update(dt) {
        this.player1.update(dt);
        this.player2.update(dt);   
    }


    /**
     * Renders the game
     * @param {CanvasRenderingContext2D} ctx the context to be drawn
     */
    render(ctx) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.player1.render(ctx);
        this.player2.render(ctx);
    }  

    
    /**
     * Called when a key is pressed.
     * @param {KeyboardEvent} e 
     */
    keydown(e) {
        this.player1.keydown(e);
        this.player2.keydown(e);
    }
    /**
     * Called when a key is released. 
     * @param {KeyboardEvent} e 
     */
    keyup(e) {
        this.player1.keyup(e);
        this.player2.keyup(e);
    }   

}   