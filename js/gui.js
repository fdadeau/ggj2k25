/**
 * Class describing the Graphical User Interface
 */

import { WIDTH, HEIGHT } from "./app.js";

import { Game } from "./game.js";

import { ChewingGum }  from "./chewinggum.js";

import data from "./assets.js";


const DEBUG = false;

export const CONTROLS = [
    { up: "KeyW",    down: "KeyS",      left: "KeyA",      right: "KeyD"       },
    { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }, 
    { up: "KeyF", down: "KeyC", left: "KeyX", right: "KeyV" }, 
    { up: "KeyH", down: "KeyB", left: "KeyN", right: "KeyG" } 
]

export const STATE = { 
    LOADING: -999,                
    TITLE_SCREEN: 0,
    IN_GAME: 2,
    CONTROLS_SCREEN: 3, 
    GAMEOVER: 999
}

let framerate = { time: 0, frames: 0, rate: 0 };


class GUI {

    constructor() {
        /** @type {number} Current state of the GUI */
        this.state = STATE.LOADING;
        /** @type {Game} Game instance */
        this.game = null;
        /** @type {string} debug info */
        this.debug = null;
        /** @type {Object} message info */
        this.info = null;

        
        this.BUTTONS = {
            "btnPlay": new Button("Play", WIDTH*3/10, 340, 100, 30, "crayon_libre"),
            "btnControls": new Button("Controls", WIDTH*5/10, 340, 100, 30, "crayon_libre"),
            "btnCredits": new Button("Credits", WIDTH*7/10, 340, 100, 30, "crayon_libre"),
            "btnBack": new Button("Back", WIDTH*9/10, 340, 100, 30, "crayon_libre"),
            "btnSlide": new Slider(  WIDTH / 2, HEIGHT / 3 - 80,200, 20,0,99,50 ),
            //"btnRadio1": new RadioButton("1 Joueur", WIDTH / 2 - 260, HEIGHT / 2 - 120, true),
            "btnRadio2": new RadioButton("2 Joueurs", WIDTH / 2 - 260, HEIGHT / 2 - 120, true),
            "btnRadio3": new RadioButton("3 Joueurs", WIDTH / 2 - 100, HEIGHT / 2 - 120, false),
            "btnRadio4": new RadioButton("4 Joueurs", WIDTH / 2 + 60, HEIGHT / 2 - 120, false)
        }       
    };


    /**
     * Displays the message on the screen
     * @param {string} txt message to display
     * @param {number} delay time of message display
     */
    writeInfo(txt, delay) {
        this.info = { txt, delay };
    }

    start() {
        this.state = STATE.TITLE_SCREEN;
    }

    /**
     * Updates the GUI
     * @param {number} dt Time elpsed since last update
     */
    update(dt) {
        framerate.time += dt;
        framerate.frames++;
        if (framerate.time >= 1000) {
            framerate.rate = framerate.frames;
            framerate.time -= 1000;
            framerate.frames = 0;
        }
        if (this.game) {
            this.game.update(dt);
            if (this.game.over) {
                this.game = null;
                this.state = STATE.TITLE_SCREEN;
            }
        }
    }



    /**
     * Renders the GUI
     * @param {CanvasRenderingContext2D} ctx Drawing area
     */
    render(ctx) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.drawImage(data["classroom"], 0, 0, WIDTH, HEIGHT);
        ctx.font = "12px arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "black";
        DEBUG && ctx.fillText(framerate.rate + " fps", 1, 14);
        DEBUG && ctx.fillText(this.debug, 1, 30);
        // game in progress
        if (this.game) {
            this.game.render(ctx);
            return;
        }
        // no current game
        if (this.state === STATE.TITLE_SCREEN) { 
            ctx.drawImage(data["logoJeu"], 220, 50, 240, 200);
            // ctx.fillStyle = "white";
            // ctx.fillText("Title goes here", 300, 100);
            this.BUTTONS.btnPlay.render(ctx);
            this.BUTTONS.btnControls.render(ctx);
            this.BUTTONS.btnCredits.render(ctx);
            return;
        }
        if (this.state === STATE.CONTROLS_SCREEN) {
            this.renderControlsScreen(ctx);
            this.BUTTONS.btnBack.render(ctx);
            this.BUTTONS.btnSlide.render(ctx);
            //this.BUTTONS.btnRadio1.render(ctx);
            this.BUTTONS.btnRadio2.render(ctx);
            this.BUTTONS.btnRadio3.render(ctx);
            this.BUTTONS.btnRadio4.render(ctx);
            return;
        }
        if (this.state === STATE.CREDITS_SCREEN) {
            this.renderCreditsScreen(ctx);
            this.BUTTONS.btnBack.render(ctx);
            return;
        }
        //
        this.BUTTONS.btnBack.render(ctx);

    }


    renderControlsScreen(ctx) {
        ctx.textAlign = "center";
        ctx.font = "20px crayon_libre";
        ctx.fillStyle = "white";
        // Titre principal
        ctx.fillText("Panneau de contrôle", WIDTH / 2-80, HEIGHT / 6-30);
        
    }

    renderCreditsScreen(ctx) {
        ctx.textAlign = "center";
        ctx.fillText("Credits screen", WIDTH/2, HEIGHT/3);

    }







    /************************************************
     *                  GUI INTERACTIONS            *
     *              (sent from GUI class)           *
     ************************************************/

    /**
     * Key down (press) event captured
     * @param {KeyboardEvent} e the keyboard event that has been captured
     */
    keydown(e) {
        if (this.game) {
            this.game.keydown(e);
        }
    }
    /**
     * Key up (release) event captured
     * @param {KeyboardEvent} e the keyboard event that has been captured
     */
    keyup(e) {
        if (this.game) {
            this.game.keyup(e);
        }
    }
    /**
     * Click on the canvas. 
     * @param {number} x X-coordinate relative to the canvas
     * @param {number} y Y-coordinate relative to the canvas
     * @returns 
     */
    click(x,y) {
        this.debug = x+","+y;
        if (this.state === STATE.TITLE_SCREEN && this.BUTTONS.btnPlay.isAt(x,y)) {
            this.game = new ChewingGum(CONTROLS,this.NbPlayers);
            this.state = STATE.IN_GAME;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN || this.state === STATE.CREDITS_SCREEN) && this.BUTTONS.btnBack.isAt(x,y)) { 
            this.state = STATE.TITLE_SCREEN;
            return;
        }
        if (this.state === STATE.TITLE_SCREEN && this.BUTTONS.btnControls.isAt(x,y)) { 
            this.state = STATE.CONTROLS_SCREEN;
            return;
        }
        if (this.state === STATE.TITLE_SCREEN && this.BUTTONS.btnCredits.isAt(x,y)) { 
            this.state = STATE.CREDITS_SCREEN;
            return;
        }

        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnSlide.isAt(x,y)) { 
            this.BUTTONS.btnSlide.updateValue(x)
            return;
        }
/*
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnRadio1.isAt(x,y)) { 
            this.BUTTONS.btnRadio1.updateValueT(x)
            this.BUTTONS.btnRadio2.updateValueF(x)
            this.BUTTONS.btnRadio3.updateValueF(x)
            this.BUTTONS.btnRadio4.updateValueF(x)
            this.NbPlayers = 1 ;

            return;
        }
*/
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnRadio2.isAt(x,y)) { 
            this.BUTTONS.btnRadio2.updateValueT(x)
            //this.BUTTONS.btnRadio1.updateValueF(x)
            this.BUTTONS.btnRadio3.updateValueF(x)
            this.BUTTONS.btnRadio4.updateValueF(x)
            this.NbPlayers = 2 ;

            return;
        }

        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnRadio3.isAt(x,y)) { 
            this.BUTTONS.btnRadio3.updateValueT(x)
            //this.BUTTONS.btnRadio1.updateValueF(x)
            this.BUTTONS.btnRadio2.updateValueF(x)
            this.BUTTONS.btnRadio4.updateValueF(x)
            this.NbPlayers = 3 ;

            return;
        }

        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnRadio4.isAt(x,y)) { 
            this.BUTTONS.btnRadio4.updateValueT(x)
            //this.BUTTONS.btnRadio1.updateValueF(x)
            this.BUTTONS.btnRadio2.updateValueF(x)
            this.BUTTONS.btnRadio3.updateValueF(x)
            this.NbPlayers = 4 ;

            return;
        }

    }
    dblclick(x, y) { return; }
    mousemove(x, y) { }
}


/**
 * GUI button
 */
class Button {

    constructor(txt, x, y, w, h, font) {
        this.x = x;
        this.y = y;
        this.txt = txt;
        this.padding = 20;
        this.height = h;
        this.width = w;
        this.x0 = x - w/2 - this.padding / 2;
        this.y0 = y - h/2 - this.padding / 2; 
        this.font = font;
    }

    render(ctx) {
        const save = ctx.font;
        ctx.verticalAlign = "middle";
        ctx.textAlign = "center";
        if (this.font == false) {
            ctx.font = `${this.height/2}px Arial`;
        } else {
            ctx.font = `${this.height/2}px ` + this.font;
        }
        
        ctx.fillStyle = "#243710";
        ctx.fillRect(this.x - this.width / 2, this.y - this.height *0.7, this.width, this.height);
        ctx.drawImage(data["slate"], this.x - this.width / 2 - 5, this.y - this.height *0.7 - 5, this.width + 10, this.height + 10)
        ctx.fillStyle = "white";
        ctx.fillText(this.txt, this.x, this.y);
        ctx.font = save;
    }

    isAt(x, y) {
        return x >= this.x0 && x <= this.x0 + this.width + this.padding && y >= this.y0 && y <= this.y0 + this.height + this.padding;
    }
}

class Slider {

    constructor( x, y, w, h, minValue, maxValue, initialValue) {
        this.x = x;
        this.y = y;
        this.padding = 20;
        this.height = h;
        this.width = w;
        this.x0 = x - w/2 - this.padding / 2;
        this.y0 = y - h/2 - this.padding / 2;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.value = initialValue; 
        this.padding = 10;
        this.handleX = this.x - this.width / 2 + ((this.value - this.minValue) / (this.maxValue - this.minValue)) * this.width;
    }

    render(ctx) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 191, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.handleX, this.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = `${this.height}px crayon_libre`;
        let volume = Math.min(Math.round(this.value),100);
        ctx.fillText( volume ,this.x + this.width/2 + 20, this.y + 5 );
        ctx.fillText("Volume sonore ",this.x-185, this.y + 5);

    }

    isAt(x, y) {
        const dx = x - this.handleX;
        const dy = y - this.y;
        return x >= this.x0 && x <= this.x0 + this.width + this.padding && y >= this.y0 && y <= this.y0 + this.height + this.padding;   
     }
    
    updateValue(x){
        this.handleX = x;
        this.value = this.minValue + (this.maxValue - this.minValue) * (x - this.x0) / this.width;
    }

    getValue() {
        return this.value;
    }


}
class RadioButton {
    constructor(label, x, y, selected = false) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.radius = 10; // Taille du bouton
        this.selected = selected;
    }

    render(ctx) {
        // Dessiner le cercle externe
        ctx.strokeStyle = "rgba(255, 191, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Dessiner le cercle interne si sélectionné
        if (this.selected) {
            ctx.fillStyle = "rgba(173, 235, 179, 0.8)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dessiner le label
        ctx.fillStyle = "white";
        ctx.font = "16px crayon_libre";
        ctx.textAlign = "left";
        ctx.fillText(this.label, this.x + 20, this.y + 5);
    }

    isAt(x, y) {
        // Vérifier si la souris est sur ce bouton radio
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
    updateValueT(x){
        this.selected = true;
    }
    updateValueF(x){
        this.selected = false;
    }
}



export default GUI;
