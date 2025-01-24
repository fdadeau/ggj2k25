
import { WIDTH, HEIGHT } from "./app.js";
import { Entity } from "./entity.js";
import { Game } from "./game.js";

import { Player } from "./player.js";

const COLOR1 = { border: 'rgba(0, 191, 255, 0.8)', content: 'rgba(173, 216, 230, 0.7)' }
const COLOR2 = { border: 'rgba(255, 191, 255, 0.8)', content: 'rgba(255, 216, 230, 0.7)' }

import { audio } from "./audio.js";
import data from "./assets.js";


const STATES = { INSTRUCTIONS: 0, IN_GAME: 1, SHOW_SCORES: -1 }

/**
 * ChewingGame micro-game
 */
export class ChewingGum extends Game {

    constructor(ctrl1, ctrl2) {
        super(new Player(ctrl1, COLOR1, 100, 1, 1), new Player(ctrl2, COLOR2, WIDTH - 100, -1, 2));
        this.teacher = new Teacher(300, 120);
        this.state = STATES.INSTRUCTIONS;
    }

    restart() {
        this.player1.reset();
        this.player2.reset();
        this.teacher.reset();
        this.state = STATES.INSTRUCTIONS;
    }

    update(dt) {
        if (this.state !== STATES.IN_GAME) return;

        this.teacher.update(dt);
        if (this.teacher.finishedWriting() && this.teacher.delay <= 0) {
            this.state = STATES.SHOW_SCORES;
            return;
        }   
        
        // propagate to players
        super.update(dt);
        if (this.teacher.isWatching() && this.player1.hasBubble()) {
            this.teacher.upset();
            this.player1.catch(this.teacher.delay);
        }
        if (this.teacher.isWatching() && this.player2.hasBubble()) {
            this.teacher.upset();
            this.player2.catch(this.teacher.delay);
        }
        if (!this.teacher.isWatching() && this.player1.exploded || this.player2.exploded) {
            this.teacher.stopWritingAndTurns();
        }
    }

    render(ctx) {
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        ctx.drawImage(data["salle_de_classe"], 0, 0, WIDTH, HEIGHT);

        this.teacher.render(ctx);
        this.player1.render(ctx);
        this.player2.render(ctx);

        // instructions
        switch (this.state) {
            case STATES.INSTRUCTIONS: 
                this.renderInstructions(ctx);
                break;
            case STATES.SHOW_SCORES:
                this.renderScores(ctx);
                break;
        }
    }

    keydown(e) {
        super.keydown(e);
        if (this.state == STATES.INSTRUCTIONS && e.code == "Space") {
            this.state = STATES.IN_GAME;
            return;
        }
        if (this.state == STATES.SHOW_SCORES && e.code == "Space") {
            this.restart();
            this.state = STATES.IN_GAME;
            return;
        }
        if (this.state == STATES.SHOW_SCORES && e.code == "Escape") {
            this.over = true;
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
        ctx.fillText("Press SPACE to start the game", WIDTH / 2, HEIGHT - MARGIN * 1.2);
        ctx.textAlign = "left";
        ctx.fillText("Maintain Z (player 1) or UP (player 2) to grow a bubble of gum", MARGIN + 20, MARGIN + 100);
        ctx.fillText("Press D (player 1) or DOWN (player 2) to swallow the bubble", MARGIN + 20, MARGIN + 130);
        ctx.fillText("Don't have a gum bubble when the teacher is facing you!", MARGIN + 20, MARGIN + 160);
        ctx.fillText("The bigger the bubbles, the more points you win!", MARGIN + 20, MARGIN + 210);
        ctx.fillText("But take care: bigger bubbles are more likely to explode...", MARGIN + 20, MARGIN + 240);
    }

    renderScores(ctx) {
        const MARGIN = 100;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.fillRect(MARGIN, MARGIN, WIDTH - 2*MARGIN, HEIGHT * 0.6);
        ctx.strokeRect(MARGIN, MARGIN, WIDTH - 2*MARGIN, HEIGHT * 0.6);
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("Scores", WIDTH / 2, MARGIN * 1.5);
        ctx.fillText("Press SPACE to restart the game or ESC to return to the menu", WIDTH / 2, HEIGHT - MARGIN * 1.2);
        ctx.textAlign = "left";
        const players = [this.player1, this.player2].sort((p1,p2) => p2.points - p1.points);
        players.forEach((p,i) => {
            if (i == 0) {
                ctx.fillStyle = "green";
            }
            else if (i == players.length-1) {
                ctx.fillStyle = "red";
            }
            else {
                ctx.fillStyle = "black";
            }
            ctx.fillText(`${i+1}. Player ${p.id}`, WIDTH / 2 - 100, MARGIN + 120 + i * 20);
            ctx.textAlign = "right";
            ctx.fillText(`${p.points}`, WIDTH / 2 + 100, MARGIN + 120 + i * 20);
            ctx.textAlign = "left";
        });
    }

}


const TEACHER_STATES = { FACING: "green", WRITING: "black", STOPPED: "#000", ANGRY: "red" };

const TEACHER_WRITING_SPEED = 0.02;
const TEACHER_WALKING_SPEED = 0.06;

const MAX_DELAY = 20000;    // 20 sec.
const DELAY_STOP = 3000;
const DELAY_QUESTION_MARK = 200;

const TEACHER_TXT = ["Tester c'est douter, bande de petits joueurs."]//, "12 ans 1ère clope, 18 ans 1ère p***, 21 ans 1ère ligne de Scheme","Je ferais avouer au pape qu'il est noir, juif et communiste."];

class Teacher extends Entity {

    constructor(x, y) {
        super(x, y, 0, 0);
        this.state = TEACHER_STATES.FACING;
        this.line = 0;
        this.minX = 100;
        this.maxX = 600;
        this.dX = -1;
        this.question = 0;
        this.delay = DELAY_STOP / 3;
        audio.playSound("teacher-talk", "teacher-talk", 0.5, 1, true);
    }

    reset() {
        super.reset();
        this.state = TEACHER_STATES.FACING;
        this.line = 0;
        this.minX = 100;
        this.maxX = 600;
        this.dX = -1;
        this.question = 0;
        this.delay = DELAY_STOP;
        audio.playSound("teacher-talk", "teacher-talk", 0.5, 1, true);
    }

    upset() {
        if (this.state == TEACHER_STATES.FACING) {
            this.state = TEACHER_STATES.ANGRY;
            this.delay = DELAY_STOP;
            audio.playSound("scream" + Math.floor(Math.random() * 4),"teacher",0.8,0);
        }   
    }

    finishedWriting() {
        return this.line >= TEACHER_TXT.length;
    }
    isWatching() {
        return this.state != TEACHER_STATES.WRITING && this.state != TEACHER_STATES.STOPPED;
    }
    stopWritingAndTurns() {
        this.state = TEACHER_STATES.STOPPED;
        this.delay = DELAY_STOP;
        audio.pause("teacher-talk");
    }

    update(dt) {
        this.delay -= dt;
                
        if (this.finishedWriting()) {
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
                            this.stopWritingAndTurns();
                        }
                    }
                }
                if (this.delay < 0) {
                    this.state = TEACHER_STATES.STOPPED;
                    this.delay = DELAY_QUESTION_MARK * 6;
                    //this.question = 1;
                    audio.pause("teacher-talk");
                }
                break;
            case TEACHER_STATES.STOPPED: 
                if (this.delay < 0) {
                    if (this.question < 3) {
                        this.question++;
                        this.delay = DELAY_QUESTION_MARK;
                    }
                    else {
                        this.question = 0;
                        this.state = TEACHER_STATES.FACING;
                        this.delay = DELAY_STOP;
                    }
                }
                break;
            case TEACHER_STATES.FACING: 
                if (this.delay < 0) {
                    this.delay = Math.floor(Math.random() * MAX_DELAY);
                    this.state = TEACHER_STATES.WRITING;
                    audio.resume("teacher-talk");
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
        //ctx.fillStyle = "rgb(24,37,10)";
        //ctx.fillRect(this.minX, 30, 500, 250);
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
        if (this.dX > 0 && txt) {
            ctx.fillText(txt.substring(0, Math.floor(txt.length * (this.x-this.minX)/(this.maxX-this.minX))), lineStart, 100+this.line*30);
        }
        
        // teacher
        ctx.strokeStyle = this.state;
        ctx.fillStyle = "gray";
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x, this.y, 80, 200);
        ctx.fillRect(this.x, this.y, 80, 200);
        ctx.fillStyle = "white";
        const label = { "green": "Scrute", "red": "En colère", "black": "Ecrit", "#000": "En arrêt"}
        ctx.fillText(label[this.state], this.x + 10, this.y + 120)

        const save = ctx.font;
        ctx.font = "30px arial";
        ctx.fillStyle = "red";
        this.question > 0 && ctx.fillText("?", this.x + 30, this.y - 30);
        this.question > 1 && ctx.fillText("?", this.x + 10, this.y - 40);
        this.question > 2 && ctx.fillText("?", this.x + 50, this.y - 20);
        ctx.font = save;
    }

}