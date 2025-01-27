/**
 * Class describing the Graphical User Interface
 */

import { audio } from "./audio.js";

import { WIDTH, HEIGHT } from "./app.js";

import { Game } from "./game.js";

import { ChewingGum }  from "./chewinggum.js";

import data from "./assets.js";


const DEBUG = false;

let ctrls = [ "KeyW", "KeyS", "ArrowUp", "ArrowDown", "KeyF", "KeyC", "KeyO", "KeyL" ];



export const CONTROLS = [
    { up: ctrls[0], down: ctrls[1]},
    { up: ctrls[2], down: ctrls[3]}, 
    { up: ctrls[4], down: ctrls[5]}, 
    { up: ctrls[6], down: ctrls[7] } 
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
        this.NbPlayers = 2;

        
        this.BUTTONS = {
            "btnPlay": new Button("Play", WIDTH*3/10, 350+75, 100, 40, "crayon_libre"),
            "btnControls": new Button("Controls", WIDTH*5/10, 350+75, 100, 40, "crayon_libre"),
            "btnCredits": new Button("Credits", WIDTH*7/10, 350+75, 100, 40, "crayon_libre"),
            "btnBack": new Button("Back", WIDTH*9/10, 350+75, 100, 40, "crayon_libre"),
            "btnSlide": new Slider(  WIDTH / 2, HEIGHT / 3 - 60+75,200, 20,0,99,50 ),
            //"btnRadio1": new RadioButton("1 Joueur", WIDTH / 2 - 260, HEIGHT / 2 - 120, true),
            "btnRadio2": new RadioButton("2 players", WIDTH / 2 - 260, HEIGHT / 2 - 35, true),
            "btnRadio3": new RadioButton("3 players", WIDTH / 2 - 100, HEIGHT / 2 - 35, false),
            "btnRadio4": new RadioButton("4 players", WIDTH / 2 + 60, HEIGHT / 2 - 35, false),
            "btnInput1up": new InputControl("grow", WIDTH / 2 - 255, HEIGHT / 2 + 20 , 65, 25, 0),
            "btnInput1down": new InputControl("sip", WIDTH / 2 - 255, HEIGHT / 2 + 55 , 65, 25, 1),
            "btnInput2up": new InputControl("grow", WIDTH / 2 - 145, HEIGHT / 2 + 20 , 65, 25, 2),
            "btnInput2down": new InputControl("sip", WIDTH / 2 - 145, HEIGHT / 2 + 55 , 65, 25, 3),
            "btnInput3up": new InputControl("grow", WIDTH / 2 - 35, HEIGHT / 2 + 20 , 65, 25, 4),
            "btnInput3down": new InputControl("sip", WIDTH / 2 - 35, HEIGHT / 2 + 55 , 65, 25, 5),
            "btnInput4up": new InputControl("grow", WIDTH / 2 +  85, HEIGHT / 2 + 20 , 65, 25, 6),
            "btnInput4down": new InputControl("sip", WIDTH / 2 + 85, HEIGHT / 2 + 55 , 65, 25, 7)        
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
            ctx.drawImage(data["logoJeu"], 220, 50+75, 240, 200);
            // ctx.fillStyle = "white";
            // ctx.fillText("Title goes here", 300, 100);
            this.BUTTONS.btnPlay.render(ctx);
            this.BUTTONS.btnControls.render(ctx);
            this.BUTTONS.btnCredits.render(ctx);
            ctx.font = "20px crayon_libre";
            ctx.fillStyle = "black"
            ctx.fillText("Game set for", 730, 170);
            ctx.fillText(this.NbPlayers + " players", 730, 200);
            ctx.fillText("Press play", 730, 270);
            ctx.fillText(" to start!", 730, 300);
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
            this.BUTTONS.btnInput1up.render(ctx);
            this.BUTTONS.btnInput1down.render(ctx);
            this.BUTTONS.btnInput2up.render(ctx);
            this.BUTTONS.btnInput2down.render(ctx);
            if (this.NbPlayers >= 3) {
                this.BUTTONS.btnInput3up.render(ctx);
                this.BUTTONS.btnInput3down.render(ctx);
            }

            if (this.NbPlayers == 4) {
                this.BUTTONS.btnInput4up.render(ctx);
                this.BUTTONS.btnInput4down.render(ctx);
            }


            ctx.font = "20px crayon_libre";
            ctx.fillStyle = "black"
            ctx.fillText("Game setup", 730, 170);
            return;
        }
        if (this.state === STATE.CREDITS_SCREEN) {
            this.renderCreditsScreen(ctx);
            ctx.font = "20px crayon_libre";
            ctx.fillStyle = "black"
            ctx.fillText("The game was", 670, 160);
            ctx.fillText("made during ", 680, 190);
            ctx.drawImage(data["logoGGJ"], 700, 210, 80, 80);
            ctx.fillText("Besançon 2025", 670, 310);
            this.BUTTONS.btnBack.render(ctx);
            return;
        }
        //
        this.BUTTONS.btnBack.render(ctx);
    }


    renderControlsScreen(ctx) {
        ctx.textAlign = "center";
        ctx.font = "22px crayon_libre";
        ctx.fillStyle = "white";
        // Titre principal
        ctx.fillText("Controls", WIDTH / 2-80, HEIGHT / 6-20+75);
        
    }

    renderCreditsScreen(ctx) {
        ctx.textAlign = "center";
        ctx.font = "20px crayon_libre";
        ctx.fillStyle = "white";
        ctx.fillText("Credits", 350, 60+75);
        ctx.font = "16px crayon_libre";
        ctx.textAlign = "left";
        ctx.fillText("Programming", 140, 100+75);
        ctx.fillText("Dorine, Eléa, Fred", 170, 120+75);
        ctx.fillText("Visual design", 140, 160+75);
        ctx.fillText("Eléa", 170, 180+75);
        ctx.fillText("Sounds", 140, 210+75);
        ctx.fillText("Fabrice", 170, 230+75);
        ctx.save();
        ctx.translate(420, 180+75);
        ctx.rotate(0.02);
        ctx.fillRect(-70, -90, 140, 160);
        ctx.drawImage(data["team"], -65, -85, 130, 130);
        ctx.fillStyle = "black";
        ctx.font = "13px crayon_libre";
        ctx.fillText("The fantastic team", -60, 62);
        ctx.restore();
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
        this.BUTTONS.btnInput1up.setKey(e);
        this.BUTTONS.btnInput1down.setKey(e);
        this.BUTTONS.btnInput2up.setKey(e);
        this.BUTTONS.btnInput2down.setKey(e);
        this.BUTTONS.btnInput3up.setKey(e);
        this.BUTTONS.btnInput3down.setKey(e);
        this.BUTTONS.btnInput4up.setKey(e);
        this.BUTTONS.btnInput4down.setKey(e);
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
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput1up.isAt(x,y)) { 

            this.BUTTONS.btnInput1up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput1down.isAt(x,y)) { 
            this.BUTTONS.btnInput1down.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput2up.isAt(x,y)) { 
            this.BUTTONS.btnInput2up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput2down.isAt(x,y)) { 
            this.BUTTONS.btnInput2down.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput3up.isAt(x,y)) { 
            this.BUTTONS.btnInput3up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput3down.isAt(x,y)) { 
            this.BUTTONS.btnInput3down.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput4up.isAt(x,y)) { 
            this.BUTTONS.btnInput4up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput4down.isAt(x,y) ) { 
            this.BUTTONS.btnInput4down.isFocused = true;
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
        audio.setVolume(volume/100);
        ctx.fillText( volume ,this.x + this.width/2 + 20, this.y + 5 );
        ctx.fillText("Sound volume",this.x-185, this.y + 5);

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

class InputControl {
    constructor(label, x, y, width, height,id) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.key = ctrls[id]; 
        this.isFocused = false; 
        this.id = id;
    }

    render(ctx) {
        // Dessiner le label
        ctx.fillStyle = "white";
        ctx.font = "12px crayon_libre";
        ctx.textAlign = "left";
        ctx.fillText(this.label, this.x - 30, this.y + 15 );

        if (this.id %2 == 0) {
            let number = Math.floor(this.id / 2) + 1;   
            ctx.fillText("Player" + number, this.x, this.y - 15 );
        }
        // Dessiner la zone de saisie
        ctx.strokeStyle = this.isFocused ? "lightblue" : "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Afficher la touche sélectionnée
        ctx.fillStyle = "white";
        ctx.font = "12px crayon_libre";
        ctx.textAlign = "center";
        ctx.fillText(this.key, this.x + this.width / 2, this.y + this.height / 2 + 5);
    }

    isAt(x, y) {
        // Vérifier si la souris est dans la zone
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    focus() {
        this.isFocused = true;
    }
    
    setKey(e) {
        if (this.isFocused) {
            this.key = e.code;
            this.isFocused = false;
            ctrls[0] = e.code;
        }
    }
}



export default GUI;
