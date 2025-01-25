import { Entity } from "./entity.js";
import { audio } from "./audio.js";

const TEACHER_STATES = { FACING: "green", WRITING: "black", STOPPED: "#000", ANGRY: "red" };

const TEACHER_WRITING_SPEED = 0.02;
const TEACHER_WALKING_SPEED = 0.06;

const MAX_DELAY = 20000;    // 20 sec.
const DELAY_STOP = 3000;
const DELAY_QUESTION_MARK = 200;
const DELAY_ANGRY = 1000;

const TEACHER_TXT = ["Tester c'est douter, bande de petits joueurs."]//, "12 ans 1ère clope, 18 ans 1ère p***, 21 ans 1ère ligne de Scheme","Je ferais avouer au pape qu'il est noir, juif et communiste."];

export class Teacher extends Entity {

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
                    this.delay = DELAY_QUESTION_MARK * 3;
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
                    this.delay = DELAY_ANGRY;
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
        this.question > 1 && ctx.fillText("?", this.x - 10, this.y - 10);
        this.question > 2 && ctx.fillText("?", this.x + 70, this.y);
        ctx.font = save;
    }

}