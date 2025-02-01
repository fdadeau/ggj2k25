import { Entity } from "./entity.js";
import { audio } from "./audio.js";
import data from "./assets.js";

const TEACHER_STATES = { FACING: "green", WRITING: "black", STOPPED: "#000", ANGRY: "red" };

const TEACHER_WRITING_SPEED = 0.02;
const TEACHER_WALKING_SPEED = 0.07;

const MAX_DELAY = 20000;    
const DELAY_STOP = 3000;
const DELAY_QUESTION_MARK = 200;
const DELAY_ANGRY = 1000;

const TEACHER_TXT = [
    "Tester c'est douter, bande de petits joueurs !", 
    "12 ans 1ère clope, 15 ans 1ère cuite, 18 ans 1ère p***, 21 ans 1ère ligne de Scheme",
    "Je ferais avouer au pape qu'il est noir, juif et communiste.",
    "My students are f*cking baffled.",
    "I'm still able to f*ck as far as I know.",
    "I'm not afraid of s*x!",
    "Les machines de Turing c'est un rouleau de PQ qu'on déroule.",
    "Le dernier qui m'a dit que j'étais un petit joueur, sa nana l'a reconnu à ses godasses.",
    "Croyez-moi, le harcèlement, ça paie !",
    "Tu préfères faire du XML Schema ou te faire sauter le caisson ?",
    "Chacun pour soi, la trique pour tous !",
    "Le dernier qui m'a dit que j'étais un petit joueur, je l'ai décalqué contre un mur."
];

const DELTA_MIN_X = [0, 5, 18, 17];

export class Teacher extends Entity {

    constructor(x, y) {
        super(x, y, 0, 0);
        // base minimal X value
        this.baseMinX = -34;
        // maximal X value (depending on the line)
        this.maxX = 600;
        this.body = "teacher_body_front";
        // last used scream (for not performing the same twice in a row)
        this.lastScream = -1;
        // call reinit that set the other parameters
        this.reset();        
    }

    minX() {
        return this.baseMinX + DELTA_MIN_X[this.line];
    }

    reset() {
        super.reset();
        // state
        this.state = TEACHER_STATES.FACING;
        // line of text that is currently written
        this.line = 0;
        // movement direction 
        this.dX = -1;
        // number of "?" above teacher's head
        this.question = 0;
        // delay before doing anything
        this.delay = DELAY_STOP / 3;
        // loads and pauses the talk
        audio.playSound("teacher-talk", "teacher-talk", 0.6, 1, true);
        // 
        this.txt = [];
        while (this.txt.length < 3) {
            let t = TEACHER_TXT[Math.floor(Math.random() * TEACHER_TXT.length)];
            if (this.txt.indexOf(t) < 0) {
                this.txt.push(t);
            }
        }
    }

    upset() {
        if (this.state == TEACHER_STATES.FACING || this.state == TEACHER_STATES.ANGRY) {
            audio.pause("teacher-talk");
            this.state = TEACHER_STATES.ANGRY;
            this.delay = DELAY_STOP;
            let scr =  Math.floor(Math.random() * 4);
            while (scr == this.lastScream) {
                scr =  Math.floor(Math.random() * 4);
            }
            this.lastScream = scr;
            audio.playSound("scream" + scr, "teacher", 0.8, 0);
        }   
    }

    finishedWriting() {
        return this.line >= this.txt.length;
    }
    isWatching() {
        return this.state != TEACHER_STATES.WRITING && this.state != TEACHER_STATES.STOPPED;
    }
    isAngry() {
        return this.state == TEACHER_STATES.ANGRY;
    }

    stopWritingAndTurns() {
        this.state = TEACHER_STATES.FACING;
        this.delay = DELAY_STOP;
        this.question = 0;
        audio.pause("teacher-talk");
    }

    update(dt) {
        this.delay -= dt;
        if (this.delay <= 0) {
            this.delay = 0;
        }
                
        if (this.finishedWriting()) {
            return;
        }

        switch (this.state) {
            case TEACHER_STATES.WRITING:
                if (this.dX < 0) {
                    this.x += this.dX * TEACHER_WALKING_SPEED * dt;
                    if (this.x <= this.minX()) {
                        this.x = this.minX();
                        this.dX = 1;
                    }
                }
                else if (this.dX > 0) {
                    this.x += this.dX * TEACHER_WRITING_SPEED * dt;
                    if (this.x > this.maxX) {
                        this.dX = -1;
                        this.line++;
                        this.stopWritingAndTurns();
                    }
                }
                if (this.delay <= 0) {
                    this.state = TEACHER_STATES.STOPPED;
                    this.delay = DELAY_QUESTION_MARK * 3;
                    audio.pause("teacher-talk");
                }
                break;
            case TEACHER_STATES.STOPPED: 
                if (this.delay <= 0) {
                    if (this.question < 4) {
                        this.question += 1;
                        this.delay = DELAY_QUESTION_MARK;
                    }
                    else {
                        this.question = 0;
                        if (Math.random() > 0.5) { 
                            this.state = TEACHER_STATES.FACING;
                            this.delay = DELAY_STOP;
                        }
                        else {
                            Math.random() < 0.1 && audio.playSound("fart", "teacher", 0.1, 0);
                            this.delay = Math.floor(Math.random() * MAX_DELAY);
                            this.state = TEACHER_STATES.WRITING;
                            if (this.dX > 0) { 
                                audio.resume("teacher-talk");
                            }
                        }
                    }
                }
                break;
            case TEACHER_STATES.FACING:
                if (this.delay <= 0) {
                    this.delay = Math.floor(Math.random() * MAX_DELAY);
                    this.state = TEACHER_STATES.WRITING;
                    audio.resume("teacher-talk");
                }
                break;
            case TEACHER_STATES.ANGRY:
                if (this.delay <= 0) {
                    this.delay = DELAY_ANGRY;
                    this.state = TEACHER_STATES.FACING;
                }
                break;
                
        }
    }

    render(ctx) {
        // text on board
        const lineStart = 123;
        ctx.fillStyle = "white";
        ctx.font = "12px crayon_libre";
        ctx.textAlign = "left";
        const txt = this.txt[this.line];
        this.maxX = this.minX() + ctx.measureText(txt).width;
        for (let i=0; i < this.line; i++) {
            ctx.fillText(this.txt[i], lineStart, 180+i*30);
        }
        if (this.dX > 0 && txt) {
            ctx.fillText(txt.substring(0, Math.ceil(txt.length * (this.x-this.minX())/(this.maxX-this.minX()))), lineStart, 180+this.line*30);
        }
        
        //draw body
        switch (this.state) {
            case TEACHER_STATES.WRITING:
            case TEACHER_STATES.STOPPED:
                const dec = (this.x - this.minX()) / 2 % 2;
                ctx.drawImage(data["leg"], this.x + 50, this.y + 285, 40, 90);
                ctx.drawImage(data["leg"], this.x + 90, this.y + 285, 40, 90);
                if (this.dX > 0) {
                    ctx.drawImage(data["teacher_writing"+this.line], this.x, this.y + dec, 190, 380);
                }
                else {
                    ctx.drawImage(data["teacher_resting_arm"], this.x, this.y, 190, 380);
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
        /*
        ctx.fillStyle = "white";
        const label = { "green": "Scrute", "red": "En colère", "black": "Ecrit", "#000": "En arrêt"}
        ctx.fillText(label[this.state], this.x + 10, this.y + 120)
        */
        const save = ctx.font;
        ctx.font = "40px crayon_libre";
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        this.question > 0 && ctx.fillText("?", this.x + 75, this.y - 10);
        this.question > 0 && ctx.strokeText("?", this.x + 75, this.y - 10);
        this.question > 1 && ctx.fillText("?", this.x + 45, this.y + 10);
        this.question > 1 && ctx.strokeText("?", this.x + 45, this.y+ 10);
        this.question > 2 && ctx.fillText("?", this.x + 110, this.y);
        this.question > 2 && ctx.strokeText("?", this.x + 110, this.y);
        ctx.font = save;
    }

}