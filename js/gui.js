/**
 * Class describing the Graphical User Interface
 */

import { WIDTH, HEIGHT } from "./app.js";

import { Game } from "./game.js";

import { ChewingGum }  from "./chewinggum.js";

import data from "./assets.js";


export const CONTROLS = {
    KB1: { up: "KeyW",    down: "KeyS",      left: "KeyA",      right: "KeyD"       },
    KB2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }
}

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
            "btnPlay": new Button("Play", WIDTH*3/10, 340, 100, 30, "arial"),
            "btnControls": new Button("Controls", WIDTH*5/10, 340, 100, 30, "arial"),
            "btnCredits": new Button("Credits", WIDTH*7/10, 340, 100, 30, "arial"),
            "btnBack": new Button("Back", WIDTH*5/6, 440, 100, 30, "arial")
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
        ctx.drawImage(data["salle_de_classe"], 0, 0, WIDTH, HEIGHT);
        ctx.font = "12px arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "black";
        ctx.fillText(framerate.rate + " fps", 1, 14);
        ctx.fillText(this.debug, 1, 30);
        // game in progress
        if (this.game) {
            this.game.render(ctx);
            return;
        }
        // no current game
        if (this.state === STATE.TITLE_SCREEN) { 
            ctx.fillStyle = "white";
            ctx.fillText("Title goes here", 300, 100);
            this.BUTTONS.btnPlay.render(ctx);
            this.BUTTONS.btnControls.render(ctx);
            this.BUTTONS.btnCredits.render(ctx);
            return;
        }
        if (this.state === STATE.CONTROLS_SCREEN) {
            this.renderControlsScreen(ctx);
            this.BUTTONS.btnBack.render(ctx);
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
        ctx.fillText("Controls selection", WIDTH/2, HEIGHT/3);
        // TODO --> DORINE
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
            this.game = new ChewingGum(CONTROLS.KB1, CONTROLS.KB2);
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

        ctx.verticalAlign = "middle";
        ctx.textAlign = "center";
        if (this.font == false) {
            ctx.font = `${this.height/2}px Arial`;
        } else {
            ctx.font = `${this.height/2}px ` + this.font;
        }
        
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height * 0.7, this.width, this.height);
        ctx.fillText(this.txt, this.x, this.y);
    }

    isAt(x, y) {
        return x >= this.x0 && x <= this.x0 + this.width + this.padding && y >= this.y0 && y <= this.y0 + this.height + this.padding;
    }
}

export default GUI;