
import { WIDTH, HEIGHT } from "./app.js";
import { Game } from "./game.js";
import { Teacher } from "./teacher.js";
import { Player } from "./player.js";
import data from "./assets.js";

const COLOR1 = { border: 'rgba(0, 191, 255, 0.8)', content: 'rgba(173, 216, 230, 0.7)' }
const COLOR2 = { border: 'rgba(255, 191, 255, 0.8)', content: 'rgba(255, 216, 230, 0.7)' }
const COLOR3 = { border: 'rgba(173, 235, 179, 0.8)', content: 'rgba(192, 246, 197, 0.7)' }
const COLOR4 = { border: 'rgba( 255 , 172 , 82, 0.8)', content: 'rgba(255 , 185 , 109, 0.7)' }

const STATES = { INSTRUCTIONS: 0, IN_GAME: 1, SHOW_SCORES: -1 }

/**
 * ChewingGame micro-game
 */
export class ChewingGum extends Game {

    constructor(ctrl,nbplayer) {
        let instance = [new Player(ctrl[0], COLOR1, 100, 1, 1)];
        // Ajout des joueurs supplémentaires en fonction du nombre de joueurs
        switch (nbplayer) {
            case 2:
                instance.push(new Player(ctrl[1], COLOR2, WIDTH - 100, -1, 2));
                break ;
            case 3:
                instance.push(new Player(ctrl[1], COLOR2, 300, 1, 2));
                instance.push(new Player(ctrl[2], COLOR3, WIDTH - 100, -1, 3));
                break ;
            case 4:
                console.log("4 players");
                instance.push(new Player(ctrl[1], COLOR2, 300, 1, 2));
                instance.push(new Player(ctrl[2], COLOR3,  WIDTH - 300, -1, 3));
                instance.push(new Player(ctrl[3], COLOR4, WIDTH - 100, -1, 4));
                break ;
        }
        super(instance);
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
            this.endTime = Date.now();
            this.players.forEach(p => p.bubble.radius = 0);
            return;
        }   
        
        this.players.forEach(p => {
            p.update(dt, this.teacher.isWatching());
            if (this.teacher.isWatching() && p.hasBubble() && p.delay === 0) {
                this.teacher.upset();
                p.catch(this.teacher.delay);
            }
            if (!this.teacher.isWatching() && p.exploded) {
                this.teacher.stopWritingAndTurns();
            }
        });

        if (this.players.filter(p => !p.isInactive()).length == 1) {
            this.teacher.stopWritingAndTurns();
            this.players.forEach(p => p.bubble.dec());
            this.state = STATES.SHOW_SCORES;
            this.endTime = Date.now();
        }
        /*
        for (let i = 0; i < this.players.length; i++) {
            if (this.teacher.isWatching() && this.players[i].hasBubble() && this.players[i].delay == 0) {
                this.teacher.upset();
                this.players[i].catch(this.teacher.delay);
            }
        }
        */

    }

    render(ctx) {
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        ctx.drawImage(data["classroom"], 0, 0, WIDTH, HEIGHT);

        this.teacher.render(ctx);
        this.players.forEach(player => player.render(ctx, this.teacher.isWatching()));

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
        ctx.save();
        ctx.translate(WIDTH/2, HEIGHT/2);
        ctx.rotate(0.03);
        ctx.fillStyle = "#243710";
        const x0 = -WIDTH/2+MARGIN;
        const y0 = -HEIGHT/2+MARGIN;
        const w0 = WIDTH-2*MARGIN;
        const h0 = HEIGHT-2*MARGIN;
        ctx.fillRect(x0, y0, w0, h0);
        ctx.strokeStyle = "rgb(148,154,142, 0.5)";
        const sq = 30;
        for (let i=0; i < w0; i += sq) {
            ctx.strokeRect(x0 + i, y0, 0, h0);
        };
        for (let i=0; i < h0; i += sq) {
            ctx.strokeRect(x0, y0 + i, w0, 0);
        };
        ctx.drawImage(data["slate"], x0-40, y0-40, w0 + 80,  h0 + 80);

        
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "20px crayon_libre";
        ctx.fillText("Instructions to play", 0, y0 + 42);
        ctx.font = "16px crayon_libre";
        ctx.fillText("Press SPACE to start the game", 0, y0 + h0 - 30);
        ctx.textAlign = "left";
        ctx.fillText("Maintain Button 1 to grow a bubble of gum", x0+40, y0 + 80);
        ctx.fillText("Press Button 2 to swallow the bubble", x0 + 40, y0 + 110);
        ctx.fillText("Don't have a gum bubble when the teacher is facing you!", x0 + 40, y0 + 140);
        ctx.fillText("The bigger the bubbles, the more points you win!", x0 + 40, y0 + 190);
        ctx.fillText("But take care: bigger bubbles are more likely to explode...", x0 + 40, y0 + 220);
        ctx.restore();

    }

    renderScores(ctx) {
        const MARGIN = 100;
        ctx.save();
        const dX = Math.min((Date.now() - this.endTime) / 500, 1);
        ctx.translate(WIDTH/2, dX * 20 + (HEIGHT/2 - 20));
        ctx.rotate(-0.02);
        ctx.fillStyle = "#243710";
        const x0 = -WIDTH/2+MARGIN;
        const y0 = -HEIGHT/2+MARGIN;
        const w0 = WIDTH-2*MARGIN;
        const h0 = HEIGHT-2*MARGIN;
        ctx.fillRect(x0, y0, w0, h0);
        ctx.strokeStyle = "rgb(148,154,142, 0.5)";
        const sq = 30;
        for (let i=0; i < w0; i += sq) {
            ctx.strokeRect(x0 + i, y0, 0, h0);
        };
        for (let i=0; i < h0; i += sq) {
            ctx.strokeRect(x0, y0 + i, w0, 0);
        };
        ctx.drawImage(data["slate"], x0-40, y0-40, w0 + 80,  h0 + 80);
        
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "22px crayon_libre";
        ctx.fillText("Scores", 0, y0 + 60);
        ctx.font = "18px crayon_libre";
        ctx.fillText("Press SPACE to restart the game or ESC to return to the menu", 0, y0 + h0 - 30);
        ctx.textAlign = "left";
        
        const players = [...this.players].sort((p1,p2) => p2.points - p1.points);
        
        players.forEach((p,i) => {
            ctx.fillStyle = "white";
            ctx.fillText(`${i+1}. Player ${p.id}`, 0 - 100, y0 + 120 + i * 30);
            ctx.textAlign = "right";
            ctx.fillText(`${p.points}`, 0 + 100, y0 + 120 + i * 30);
            ctx.textAlign = "left";
        });
        ctx.restore();
    }

}

