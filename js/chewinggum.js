
import { WIDTH, HEIGHT } from "./app.js";
import { Game } from "./game.js";
import { Teacher } from "./teacher.js";
import { Player } from "./player.js";

const COLOR1 = { border: 'rgba(0, 191, 255, 0.8)', content: 'rgba(173, 216, 230, 0.7)' }
const COLOR2 = { border: 'rgba(255, 191, 255, 0.8)', content: 'rgba(255, 216, 230, 0.7)' }

import data from "./assets.js";


const STATES = { INSTRUCTIONS: 0, IN_GAME: 1, SHOW_SCORES: -1 }

/**
 * ChewingGame micro-game
 */
export class ChewingGum extends Game {

    constructor(ctrl1, ctrl2) {
        super([new Player(ctrl1, COLOR1, 100, 1, 1), new Player(ctrl2, COLOR2, WIDTH - 100, -1, 2)]);
        this.teacher = new Teacher(300, 75);
        this.state = STATES.INSTRUCTIONS;
    }

    restart() {
        this.players.forEach(p => p.reset());   
        this.teacher.reset();
        this.state = STATES.INSTRUCTIONS;
    }

    update(dt) {
        if (this.state !== STATES.IN_GAME) return;

        this.teacher.update(dt);
        if (this.teacher.finishedWriting() && this.teacher.delay <= 0) {
            this.state = STATES.SHOW_SCORES;
            this.players.forEach(p => p.bubble.radius = 0);
            return;
        }   
        
        // propagate to players
        super.update(dt);

        for (let i = 0; i < this.players.length; i++) {
            if (this.teacher.isWatching() && this.players[i].hasBubble()) {
                this.teacher.upset();
                this.players[i].catch(this.teacher.delay);
            }
            if (!this.teacher.isWatching() && this.players[i].exploded) {
                this.teacher.stopWritingAndTurns();
            }

        }
    }

    render(ctx) {
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        ctx.drawImage(data["classroom"], 0, 0, WIDTH, HEIGHT);

        this.teacher.render(ctx);
        this.players.forEach(player => player.render(ctx));

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
        if (this.state === STATES.IN_GAME) {
            super.keydown(e);
        }
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
        // ctx.fillStyle = "white";
        // ctx.strokeStyle = "black";
        // ctx.fillRect(MARGIN, MARGIN, WIDTH - MARGIN*2, HEIGHT-MARGIN*2);
        // ctx.strokeRect(MARGIN, MARGIN, WIDTH - MARGIN*2, HEIGHT-MARGIN*2);
        ctx.drawImage(data["blackboard"], MARGIN, MARGIN,WIDTH - 2*MARGIN,  HEIGHT * 0.65);
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "14px crayon_libre";
        ctx.fillText("Instructions to play....", WIDTH / 2, MARGIN * 1.5);
        ctx.fillText("Press SPACE to start the game", WIDTH / 2, HEIGHT - MARGIN * 1.2);
        ctx.textAlign = "left";
        ctx.fillText("Maintain Z (player 1) or UP (player 2) to grow a bubble of gum", MARGIN + 40, MARGIN + 100);
        ctx.fillText("Press D (player 1) or DOWN (player 2) to swallow the bubble", MARGIN + 40, MARGIN + 130);
        ctx.fillText("Don't have a gum bubble when the teacher is facing you!", MARGIN + 40, MARGIN + 160);
        ctx.fillText("The bigger the bubbles, the more points you win!", MARGIN + 40, MARGIN + 210);
        ctx.fillText("But take care: bigger bubbles are more likely to explode...", MARGIN + 40, MARGIN + 240);
    }

    renderScores(ctx) {
        const MARGIN = 100;
        // ctx.fillStyle = "white";
        // ctx.strokeStyle = "black";
        // ctx.fillRect(MARGIN, MARGIN, WIDTH - 2*MARGIN, HEIGHT * 0.6);
        // ctx.strokeRect(MARGIN, MARGIN, WIDTH - 2*MARGIN, HEIGHT * 0.6);
        ctx.drawImage(data["blackboard"], MARGIN, MARGIN,WIDTH - 2*MARGIN,  HEIGHT * 0.65);
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "22px crayon_libre";
        ctx.fillText("Scores", WIDTH / 2, MARGIN * 1.5);
        ctx.font = "16px crayon_libre";
        ctx.fillText("Press SPACE to restart the game or ESC to return to the menu", WIDTH / 2, HEIGHT - MARGIN * 1.2);
        ctx.textAlign = "left";
        const players = [this.players[0], this.players[1]].sort((p1,p2) => p2.points - p1.points);
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
            ctx.fillText(`${i+1}. Player ${p.id}`, WIDTH / 2 - 100, MARGIN + 120 + i * 30);
            ctx.textAlign = "right";
            ctx.fillText(`${p.points}`, WIDTH / 2 + 100, MARGIN + 120 + i * 30);
            ctx.textAlign = "left";
        });
    }

}

