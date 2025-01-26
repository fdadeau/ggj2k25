/**
 * Game class (abstract class)
 */

import { HEIGHT, WIDTH } from "./app.js";

export class Game {

    /**
     * @param {Player[]} players Array of Player objects
     */
    constructor(players) {
        this.players = players; 
    }

    /**
     * Update of the game
     * @param {number} dt elapsed time since last update
     */
    update(dt) {
        this.players.forEach(player => player.update(dt));
    }


    /**
     * Renders the game
     * @param {CanvasRenderingContext2D} ctx the context to be drawn
     */
    render(ctx) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.players.forEach(player => player.render(ctx));
    }  

    
    /**
     * Called when a key is pressed.
     * @param {KeyboardEvent} e 
     */
    keydown(e) {
        this.players.forEach(player => player.keydown(e));
    }
    /**
     * Called when a key is released. 
     * @param {KeyboardEvent} e 
     */
    keyup(e) {
        this.players.forEach(player => player.keyup(e));
    }   

}   
