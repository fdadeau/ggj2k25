import { WIDTH } from "./app.js";
import { Entity } from "./entity.js";

import { audio } from "./audio.js";
import data from "./assets.js";


const MAX_CROSSES = 3;

/**
 * Player for ChewingGum game
 */
export class Player extends Entity {

    constructor(controls, color, x, dir, id) {
        super(x, 400, 0, 0);
        this.controls = controls;
        this.bubble = new Bubble(x + 20*dir, 400, color);
        // buuble grow key is pressed 
        this.growKey = false;
        // ination delay
        this.delay = 0;
        // orientation of the player
        this.dir = dir;
        // score 
        this.points = 0;
        // color
        this.color = color;
        // identifier
        this.id = id;
        // has just exploded 
        this.exploded = false;
        // cross
        this.crosses = 0;   
    }

    reset() {
        this.bubble = new Bubble(this.x + 20*this.dir, 400, this.color);
        this.growKey = false;
        this.delay = 0;
        this.points = 0;
        this.exploded = false;
        this.crosses = 0;
    }

    update(dt) {
        if (this.isInactive()) return;
        this.bubble.update(dt);
        this.points += Math.floor(this.bubble.radius);
        if (this.delay > 0) {
            this.delay -= dt;
            if (this.delay <= 0) {
                this.delay = 0;
                this.exploded = false;
            }
        }
        else if (this.bubble.speed > 0) {
            this.checkExplosion();
        }
    }

    hasBubble() {
        return this.bubble.radius > 0;
    }

    isInactive() {
        return this.crosses >= MAX_CROSSES;
    }

    checkExplosion() {
        if (this.bubble.radius > 50) {
        //if (Math.random() < 0.000001 * this.bubble.radius) {
            this.bubble.explode();
            this.points = Math.floor(this.points / 2);
            this.exploded = true;
            this.delay = 500;
            this.crosses++; 
            audio.pause("player"+this.id);
            audio.playSound("explosion","player"+this.id,0.4,0);
        }
    }

    catch(delay) {
        this.delay = delay;
        this.exploded = false;
        this.points = 0;
        this.bubble.dec();
        audio.pause("player" + this.id);;
    }

    render(ctx) {
        this.bubble.render(ctx);
        //ctx.fillStyle = "black";
        //ctx.fillRect(this.x - 25, this.y - 20, 50, 100);
        var img = (this.dir > 0) ? data["eleve1"] : data["eleve2"];
        ctx.drawImage(img, this.x - 100 -25*this.dir, this.y-100, 200, 200);
        if (this.exploded) {
            ctx.fillStyle = "red";
            ctx.fontWeight = "bold";
            ctx.fillText("PAF", this.x + 20 * this.dir, this.y-10);
        }
        if (this.isInactive()) {
            ctx.fillStyle = "red";
            ctx.fillText("GAME OVER", this.x - 30, this.y - 80);
        }

        // score 
        ctx.fillStyle = "white";
        ctx.fillText(`Player ${this.id}`, 100 + this.id * 60, 60);
        ctx.fillStyle = "red";
        ctx.fillText("x ".repeat(this.crosses), 100 + this.id * 60, 80);
        if (this.delay) {
            ctx.fillStyle = "red";
        }
        ctx.fillText(`${this.points} pts`, this.x - 30, this.y - 40);
    }

    keydown(e) {
        if (this.delay > 0 || this.isInactive()) {
            return;
        }
        if (e.code == this.controls.up && this.bubble.speed == 0) {
            this.bubble.grow();
            audio.playSound("blow", "player"+this.id, 0.3, 0);
            return;
        }
        if (e.code == this.controls.down) {
            this.bubble.dec();
        }
    }
    keyup(e) {
        if (this.bubble.speed > 0 && e.code == this.controls.up) {
            this.bubble.stop();
            audio.pause("player"+this.id);
        }
    }
}

const INC_SPEED = 0.1;
const DEC_SPEED = 0.1;
const ESSOUFFLEMENT = 0.001;

class Bubble extends Entity {

    constructor(x, y, color) {
        super(x, y, 0, 0);
        this.color = color;        
        this.speed = 0;
        this.radius = 0;
    }

    grow() {
        if (this.speed == 0) {
            this.speed = (this.save) ? this.save : INC_SPEED;
        }
    }
    stop() {
        this.save = this.speed;
        this.speed = 0;
    }
    dec() {
        this.speed = -DEC_SPEED;
    }
    explode() {
        this.speed = 0;
        this.save = null;
        this.radius = 0;
    }

    update(dt) {
        if (this.speed > 0) {
            this.speed -= ESSOUFFLEMENT * dt;
            if (this.speed < ESSOUFFLEMENT * 30) {
            //    console.log("top");
                this.speed = ESSOUFFLEMENT * 30;
            }
        }
        this.radius += this.speed * dt;
        if (this.radius < 0) {
            this.radius = 0;
            this.speed = 0;
            this.save = null;
        }
    }   
    
    render(ctx) {
        ctx.lineWidth = 2;
        ctx.fillStyle = this.color.content;
        ctx.strokeStyle = this.color.border;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }

}