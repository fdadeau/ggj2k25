
import { WIDTH, HEIGHT } from "./app.js";
import { Game } from "./game.js";
import { Teacher } from "./teacher.js";
import { Player } from "./player.js";
import { audio } from "./audio.js";
import data from "./assets.js";

const COLORS = { 
    1: { border: 'rgba(0, 191, 255, 0.8)', content: 'rgba(173, 216, 230, 0.7)', score: 'rgba(0, 191, 255, 0.8)' },
    2: { border: 'rgba(255, 191, 255, 0.8)', content: 'rgba(255, 216, 230, 0.7)', score: 'rgba(255, 117, 255, 0.8)' },
    3: { border: 'rgba(173, 235, 179, 0.8)', content: 'rgba(192, 246, 197, 0.7)', score: 'rgba(76, 225, 91, 0.8)' },
    4: { border: 'rgba( 255 , 172 , 82, 0.8)', content: 'rgba(255 , 185 , 109, 0.7)' , score: 'rgba(255, 154, 46, 0.8)' },
}

const STATES = { INSTRUCTIONS: 0, IN_GAME: 1, SHOW_SCORES: -1 }


/**
 * ChewingGame micro-game
 */
export class ChewingGum extends Game {

    constructor(ctrl,nbplayer) {
        const instance = [];
        // Ajout des joueurs supplémentaires en fonction du nombre de joueurs
        switch (nbplayer) {
            case 2:
                const skin1 = Math.floor(Math.random() * 2) + 1;
                const skin2 = Math.floor(Math.random() * 2) + 3;
                instance.push(new Player(ctrl[0], COLORS[skin1], 100, 1, 1, skin1));
                instance.push(new Player(ctrl[1], COLORS[skin2], WIDTH - 100, -1, 2, skin2));
                break ;
            case 3:
                const skin3 = Math.floor(Math.random() * 2) + 3;
                instance.push(new Player(ctrl[0], COLORS[1], 100, 1, 1, 1))
                instance.push(new Player(ctrl[1], COLORS[2], 300, 1, 2, 2));
                instance.push(new Player(ctrl[2], COLORS[skin3], WIDTH - 100, -1, 3, skin3));
                break ;
            case 4:
                instance.push(new Player(ctrl[0], COLORS[1], 100, 1, 1, 1))
                instance.push(new Player(ctrl[1], COLORS[2], 300, 1, 2, 2));
                instance.push(new Player(ctrl[2], COLORS[3], WIDTH - 300, -1, 3, 3));
                instance.push(new Player(ctrl[3], COLORS[4], WIDTH - 100, -1, 4, 4));
                break ;
        }
        super(instance);
        this.teacher = new Teacher(300, 150);
        this.state = STATES.INSTRUCTIONS;
    }

    restart() {
        this.players.forEach(p => p.reset());   
        this.teacher.reset();
        this.state = STATES.IN_GAME;
    }

    end() {
        this.state = STATES.SHOW_SCORES;
        this.endTime = Date.now();
        audio.playSound("bell", "teacher-talk", 0.4, 0);
        this.players.sort((p1,p2) => {
            // orders 
            if (p1.isInactive() && p2.isInactive()) {
                return p2.eliminatedAt - p1.eliminatedAt;
            }
            if (p1.isInactive()) {
                return 1;
            }
            if (p2.isInactive()) {
                return -1;
            }
            return p2.points - p1.points;
        });
        console.log(this.players);
    }


    update(dt) {
        if (this.state !== STATES.IN_GAME) return;

        this.teacher.update(dt);
        if (this.teacher.finishedWriting() && this.teacher.delay <= 0) {
            this.end();
            this.players.forEach(p => p.bubble.radius = 0);
            return;
        }   
        
        this.players.forEach(p => p.update(dt, this.teacher.isWatching()));

        this.players.forEach(p => {
            if (this.teacher.isWatching() && p.hasBubble() && p.delay === 0) {
                this.teacher.upset();
                p.catch(this.teacher.delay);
            }
            if (!this.teacher.isWatching() && p.exploded) {
                this.teacher.stopWritingAndTurns();
            }
        });

        if (!this.teacher.isAngry() && this.players.filter(p => !p.isInactive()).length <= 1) {
            this.teacher.stopWritingAndTurns();
            this.players.forEach(p => p.bubble.dec());
            this.end();
        }
    }

    render(ctx) {
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        ctx.drawImage(data["classroom"], 0, 0, WIDTH, HEIGHT);
        
        /** Clock and hands **/
        const size = 54;
        ctx.drawImage(data["clock"], WIDTH/2 - size/2, 30, size, size);
        const now = new Date();
        const hours = now.getHours(), mins = now.getMinutes(), secs = now.getSeconds();
        //
        ctx.strokeStyle = "rgb(75,30,28)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, 57);
        const angleH = Math.PI * 2 * (hours * 60 + mins) / (12*60);
        ctx.lineTo(WIDTH / 2 + 10 * Math.sin(angleH), 57 - 10 * Math.cos(angleH));
        ctx.stroke();
        ctx.moveTo(WIDTH / 2, 57);
        const angleM = Math.PI * 2 * mins / 60;
        ctx.lineTo(WIDTH / 2 + 15 * Math.sin(angleM), 57 - 15 * Math.cos(angleM));
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.moveTo(WIDTH / 2, 57);
        const angleS = Math.PI * 2 * secs / 60;
        ctx.lineTo(WIDTH / 2 + 15 * Math.sin(angleS), 57 - 15 * Math.cos(angleS));
        ctx.stroke();


        this.players.forEach(p => {
            ctx.fillStyle = p.delay > 0 ? "red" : p.color.border;
            ctx.font = "16px crayon_libre";
            let x = 40 + p.id * 110;
            if (p.id == this.players.length) {
                x = 40 + 4 * 110;
            }
            ctx.fillText(`Player ${p.id}`, x, 52+75);
            ctx.fillStyle = "red";
            ctx.fillText("X ".repeat(p.crosses), x, 70+75);
        });

        this.teacher.render(ctx);
        ctx.drawImage(data["tables"], 0, 0, WIDTH, HEIGHT);
        
        this.players.forEach(p => p.bubble.render(ctx));
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
        e.preventDefault();
        if (this.state === STATES.IN_GAME) {
            super.keydown(e);
        }
        if (this.state == STATES.INSTRUCTIONS && e.code == "Space") {
            this.restart();
            return;
        }
        if (this.state == STATES.INSTRUCTIONS && e.code == "Backspace") {
            this.over = true;
            return;
        }
        if (this.state == STATES.SHOW_SCORES && e.code == "Space") {
            this.restart();
            return;
        }
        if (this.state == STATES.SHOW_SCORES && e.code == "Backspace") {
            this.over = true;   
        }
    }


    renderInstructions(ctx) {
        const MARGIN = 100;
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
        ctx.fillText("How to play?", 0, y0 + 52);
        ctx.font = "15px crayon_libre";
        ctx.fillText("Press SPACE to start the game or BACKSPACE to return to menu", 0, y0 + h0 - 30);
        ctx.textAlign = "left";
        ctx.font = "16px crayon_libre";
        ctx.fillText("Maintain button 1* to grow a bubble of gum.", x0+40, y0 + 88);
        ctx.fillText("Press button 2** to swallow the bubble.", x0 + 40, y0 + 118);
        ctx.fillText("Don't have a gum bubble when the teacher is facing you!", x0 + 40, y0 + 148);
        ctx.fillText("Large bubbles increase your score, but are more likely to explode...", x0 + 40, y0 + 178);
        
        ctx.font = "14px crayon_libre";
        // Affichage des labels à gauche
        ctx.fillText(" * Grow   ", x0 + 40, y0 + 228);
        ctx.fillText("** Swallow", x0 + 40, y0 + 248); // Ligne vide pour alignement
        this.players.forEach((p, index) => {
            const spacing = 100; // Ajuste cet espacement en fonction de tes besoins
            ctx.fillText(`Player ${p.id}`, x0 + 140 + index * spacing, y0 + 208);
            ctx.fillText(`${p.controls.up}`, x0 + 140 + index * spacing, y0 + 228);
            ctx.fillText(`${p.controls.down}`, x0 + 140 + index * spacing, y0 + 248);
        });
        
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
        ctx.font = "16px crayon_libre";
        ctx.fillText("Press SPACE to restart or BACKSPACE to return to menu", 0, y0 + h0 - 30);
        ctx.textAlign = "left";
        
        this.players.forEach((p,i) => {
            ctx.fillStyle = p.color.border;
            ctx.fillText(`${i+1}. Player ${p.id}`, 0 - 100, y0 + 120 + i * 30);
            ctx.textAlign = "right";
            ctx.fillText(`${p.points}`, 0 + 100, y0 + 120 + i * 30);
            if (p.isInactive()) {
                ctx.fillRect(-105, y0 + 115 + i*30, 210, 1);
            }
            ctx.textAlign = "left";
        });
        ctx.drawImage(this.players[0].points == 0 ? data["medal_choco"] : data["medal_gold"], 160, y0+30, 100, 100);
        ctx.restore();
    }

}
