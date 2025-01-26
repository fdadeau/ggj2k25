import { WIDTH } from "./app.js";
import { Entity } from "./entity.js";

import { audio } from "./audio.js";
import data from "./assets.js";


const MAX_CROSSES = 3;

const DELAY_CHEWING = 700;
const DELAY_EXPLOSION = 500;

/**
 * Player for ChewingGum game
 */
export class Player extends Entity {

    constructor(controls, color, x, dir, id, skin) {
        super(x, 400, 0, 0);
        this.controls = controls;
        this.bubble = new Bubble(x + 20*dir, 400, color, id, dir > 0 ? 1 : 2);
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
        // skin of the character 
        this.skin = skin;
        // delay animation
        this.delayAnim = Math.random() * DELAY_CHEWING;
    }

    reset() {
        this.bubble = new Bubble(this.x + 20*this.dir, 400, this.color, this.skin, this.dir > 0 ? 1 : 2);
        this.growKey = false;
        this.delay = 0;
        this.delayAnim = Math.random() * DELAY_CHEWING;
        this.points = 0;
        this.exploded = false;
        this.crosses = 0;
    }

    update(dt, teacherIsFacing) {
        if (this.isInactive()) return;
        this.bubble.update(dt);
        if (this.bubble.speed >= 0) {
            this.points += Math.floor(this.bubble.radius);
        }
        if (this.delay > 0) {
            this.delay -= dt;
            if (this.delay <= 0) {
                this.delay = 0;
                this.exploded = false;
            }
        }
        else if (this.bubble.speed > 0 && this.bubble.radius > this.bubble.max) {
            this.bubble.explode();
            this.points = 0
            this.exploded = true;
            this.delay = DELAY_EXPLOSION;
            audio.pause("player"+this.id);
            audio.playSound("explosion","player"+this.id,0.4,0);
        }

        if (!teacherIsFacing && !this.exploded && this.bubble.radius == 0) { 
            this.delayAnim -= dt;
            if (this.delayAnim <= 0) {
                this.delayAnim = DELAY_CHEWING;
            }
        }
    }

    hasBubble() {
        return this.bubble.radius > 0;
    }

    isInactive() {
        return this.crosses >= MAX_CROSSES;
    }


    catch(delay) {
        this.delay = delay;
        this.exploded = false;
        this.points = 0;
        this.crosses++;
        this.bubble.dec();
        audio.pause("player" + this.id);
    }

    render(ctx, teacherIsFacing) {
        
        // score 
        ctx.fillStyle = "white";
        ctx.font = "16px crayon_libre";
        ctx.fillText(`Player ${this.id}`, 80 + this.id * 100, 52+75);
        ctx.fillStyle = "red";
        ctx.fillText("X ".repeat(this.crosses), 80 + this.id * 100, 70+75);
        if (this.delay) {
            ctx.fillStyle = "red";
        }

        ctx.textAlign = "right";
        ctx.fillStyle = this.color.border;
        ctx.fillText(`${this.points} pts`, WIDTH - 20, 50+75 + this.id * 40);
        ctx.textAlign = "left";

        if (this.isInactive()) {
            ctx.drawImage(data["student"+this.skin], this.x - 100 -25*this.dir, this.y-100, 200, 200);
            ctx.drawImage(data["student"+this.skin+"_black_layer"], this.x - 100 -25*this.dir, this.y-100, 200, 200);
            return;
        }

        if (this.exploded) {
            ctx.drawImage(data["paf"+this.skin], this.x + (this.dir > 0 ? - 5 : - 100) , this.y - 30, 100, 80);
        }

        //this.bubble.render(ctx);
        ctx.drawImage(data["student"+this.skin], this.x - 100 -25*this.dir, this.y-100, 200, 200);
        
        if (!this.exploded && !teacherIsFacing && this.delayAnim > DELAY_CHEWING / 2 && this.bubble.radius == 0) {
            ctx.drawImage(data["studentChewing" + this.skin], this.x - 100 -25*this.dir, this.y-100, 200, 200);
        }

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


const INC_SPEED = 0.08;
const DEC_SPEED = 0.1;
const ESSOUFFLEMENT = 0.0002;

class Bubble extends Entity {

    constructor(x, y, color, id, refl) {
        super(x, y, 0, 0);
        this.color = color;        
        this.speed = 0;
        this.radius = 0;
        this.id = id;
        this.reflect = refl;
        this.max = Math.random() * 40 + 20;
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
        this.max = Math.random() * 40 + 20;
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
        ctx.drawImage(data["bubble_reflection"+this.reflect], this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2);
    }

}