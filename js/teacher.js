import { Entity } from "./entity.js";
import { audio } from "./audio.js";
import data from "./assets.js";

const TEACHER_STATES = { FACING: "green", WRITING: "black", STOPPED: "#000", ANGRY: "red" };

const TEACHER_WRITING_SPEED = 0.02;
const TEACHER_WALKING_SPEED = 0.06;

const MAX_DELAY = 20000;    
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
        this.body = "teacher_body_front";
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
        this.state = TEACHER_STATES.FACING;
        this.delay = DELAY_STOP;
        audio.pause("teacher-talk");
    }

    update(dt) {
        this.delay -= dt;

        if (this.state == TEACHER_STATES.FACING && this.delay + dt > DELAY_STOP / 2 && this.delay <= DELAY_STOP /2 && Math.random() > 0.4) {
            audio.playSound("fart", "teacher", 0.1, 0);
        }
                
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
        // text on board
        const lineStart = this.minX + 30;
        ctx.fillStyle = "white";
        ctx.font = "10px crayon_libre";
        ctx.textAlign = "left";
        const txt = TEACHER_TXT[this.line];
        this.maxX = this.minX + ctx.measureText(txt).width;
        for (let i=0; i < this.line; i++) {
            ctx.fillText(TEACHER_TXT[i], lineStart, 100+i*30);
        }
        if (this.dX > 0 && txt) {
            ctx.fillText(txt.substring(0, Math.floor(txt.length * (this.x-this.minX)/(this.maxX-this.minX))), lineStart, 100+this.line*30);
        }
        
        //draw body
        switch (this.state) {
            case TEACHER_STATES.WRITING:
            case TEACHER_STATES.STOPPED:
                ctx.drawImage(data["leg"], this.x + 50, this.y + 285, 40, 90);
                ctx.drawImage(data["leg"], this.x + 90, this.y + 285, 40, 90);
                if (this.state == TEACHER_STATES.WRITING && this.dX > 0) {
                    const dec = (this.x - this.minX) / 2 % 2;
                    ctx.drawImage(data["teacher_writing_hand"], this.x, this.y + dec, 190, 380);
                    ctx.drawImage(data["teacher_writing_arm"], this.x, this.y + dec, 190, 380);
                }
                else {
                    ctx.drawImage(data["teacher_writing_arm"], this.x, this.y, 190, 380);
                }
                ctx.drawImage(data["teacher_body_back"], this.x, this.y, 170, 380);
                break;
            case TEACHER_STATES.ANGRY:
                const nb = (Math.floor(this.delay / 120) % 2) + 1;
                ctx.drawImage(data["teacher_angry_arm" + nb], this.x, this.y, 170, 380);
                ctx.drawImage(data["teacher_body_front"], this.x, this.y, 170, 380);
                ctx.drawImage(data["teacher_angry"], this.x, this.y, 170, 380);
                break;
            case TEACHER_STATES.FACING:
                ctx.drawImage(data["teacher_body_front"], this.x, this.y, 170, 380);
                ctx.drawImage(data["teacher_facing"], this.x, this.y, 170, 380);
        }
        ctx.fillStyle = "white";
        const label = { "green": "Scrute", "red": "En colère", "black": "Ecrit", "#000": "En arrêt"}
        ctx.fillText(label[this.state], this.x + 10, this.y + 120)

        const save = ctx.font;
        ctx.font = "30px crayon_libre";
        ctx.fillStyle = "red";
        this.question > 0 && ctx.fillText("?", this.x + 100, this.y - 30);
        this.question > 1 && ctx.fillText("?", this.x + 70, this.y - 10);
        this.question > 2 && ctx.fillText("?", this.x + 80, this.y);
        ctx.font = save;
    }

}