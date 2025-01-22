
import { WIDTH, HEIGHT } from "../app.js";
import { Entity } from "../entity.js";
import { Game } from "../game.js";

import { Player } from "./player.js";

const COLOR1 = { border: 'rgba(0, 191, 255, 0.8)', content: 'rgba(173, 216, 230, 0.7)' }
const COLOR2 = { border: 'rgba(255, 191, 255, 0.8)', content: 'rgba(255, 216, 230, 0.7)' }



/**
 * ChewingGame micro-game
 */
export class ChewingGum extends Game {

    constructor(ctrl1, ctrl2) {
        super(new Player(ctrl1, COLOR1, 100, 1, 1), new Player(ctrl2, COLOR2, WIDTH - 100, -1, 2));
        this.teacher = new Teacher(300, 120);
        this.started = false;
    }

    update(dt) {
        if (!this.started) return;
        // propagate to players
        super.update(dt);
        this.teacher.update(dt);
        if (this.teacher.isWatching() && this.player1.hasBubble()) {
            this.teacher.upset();
            this.player1.catch(this.teacher.delay);
        }
        if (this.teacher.isWatching() && this.player2.hasBubble()) {
            this.teacher.upset();
            this.player2.catch(this.teacher.delay);
        }
        if (!this.teacher.isWatching() && this.player1.exploded || this.player2.exploded) {
            this.teacher.stopWriting();
        }
        if (this.teacher.finishedWriting() && this.teacher.delay < 0) {
            this.over = 1;
        }
    }

    render(ctx) {
        super.render(ctx);
        this.teacher.render(ctx);

        // instructions
        if (!this.started) {
            this.renderInstructions(ctx);
        }

    }

    keydown(e) {
        super.keydown(e);
        if (!this.started && e.code == "Space") {
            this.started = true;
        }
    }


    renderInstructions(ctx) {
        const MARGIN = 100;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.fillRect(MARGIN, MARGIN, WIDTH - MARGIN*2, HEIGHT-MARGIN*2);
        ctx.strokeRect(MARGIN, MARGIN, WIDTH - MARGIN*2, HEIGHT-MARGIN*2);
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("Instructions to play....", WIDTH / 2, MARGIN * 1.5);
        ctx.fillText("Press spacebar to start the game", WIDTH / 2, HEIGHT - MARGIN * 1.5);

    }

}


const TEACHER_STATES = { FACING: "green", WRITING: "black", ANGRY: "red" };

const TEACHER_WRITING_SPEED = 0.02;
const TEACHER_WALKING_SPEED = 0.06;

const MAX_DELAY = 20000;    // 20 sec.
const DELAY_STOP = 3000;

const TEACHER_TXT = ["Tester c'est douter, bande de petits joueurs.", "12 ans 1ère clope, 18 ans 1ère p***, 21 ans 1ère ligne de Scheme","Je ferais avouer au pape qu'il est noir, juif et communiste."];

class Teacher extends Entity {

    constructor(x, y) {
        super(x, y, 0, 0);
        this.state = TEACHER_STATES.FACING;
        this.line = 0;
        this.minX = 100;
        this.maxX = 600;
        this.dX = -1;
        this.delay = DELAY_STOP;
    }

    upset() {
        if (this.state == TEACHER_STATES.FACING) {
            this.state = TEACHER_STATES.ANGRY;
            this.delay = DELAY_STOP;
        }
        
    }

    finishedWriting() {
        return this.line < 0;
    }
    isWatching() {
        return this.state != TEACHER_STATES.WRITING;
    }
    stopWriting() {
        this.state = TEACHER_STATES.FACING;
        this.delay = DELAY_STOP;
    }

    update(dt) {
        this.delay -= dt;
                
        if (this.line < 0) {
            return;
        }

        switch (this.state) {
            case TEACHER_STATES.WRITING:
                if (this.dX < 0) {
                    this.x += this.dX * TEACHER_WALKING_SPEED * dt;
                    if (this.x <= this.minX) {
                        this.x = this.minX;
                        this.dX = 1;
                    }
                }
                else if (this.dX > 0) {
                    this.x += this.dX * TEACHER_WRITING_SPEED * dt;
                    if (this.x > this.maxX) {
                        this.dX = -1;
                        this.line++;
                        if (this.line >= TEACHER_TXT.length) {
                            this.line = -1;
                        }
                    }
                }
                if (this.delay < 0) {
                    this.state = TEACHER_STATES.FACING;
                    this.delay = DELAY_STOP;
                }
                break;
            case TEACHER_STATES.FACING: 
                if (this.delay < 0) {
                    this.delay = Math.floor(Math.random() * MAX_DELAY);
                    this.state = TEACHER_STATES.WRITING;
                }
                break;
            case TEACHER_STATES.ANGRY:
                if (this.delay < 0) {
                    this.delay = 1000;
                    this.state = TEACHER_STATES.FACING;
                }
                break;
                
        }
    }

    render(ctx) {
        // black board
        ctx.fillStyle = "black";
        ctx.fillRect(this.minX, 30, 500, 250);
        // text on board
        const lineStart = this.minX + 30;
        ctx.fillStyle = "white";
        ctx.font = "10px monospace";
        ctx.textAlign = "left";
        const txt = TEACHER_TXT[this.line];
        this.maxX = this.minX + ctx.measureText(txt).width;
        for (let i=0; i < this.line; i++) {
            ctx.fillText(TEACHER_TXT[i], lineStart, 100+i*30);
        }
        if (this.dX > 0) {
            ctx.fillText(txt.substring(0, Math.floor(txt.length * (this.x-this.minX)/(this.maxX-this.minX))), lineStart, 100+this.line*30);
        }
        
        // teacher
        ctx.strokeStyle = this.state;
        ctx.fillStyle = "gray";
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x, this.y, 80, 200);
        ctx.fillRect(this.x, this.y, 80, 200);
    }

}