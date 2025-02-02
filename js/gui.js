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
            "btnSlide": new Slider(  WIDTH / 2, HEIGHT / 3 - 60+70,200, 16,0,100,50 ),
            "btnRadio2": new RadioButton("2 players", 200, HEIGHT / 2 - 35, 100, 24, true),
            "btnRadio3": new RadioButton("3 players", 350, HEIGHT / 2 - 35, 100, 24, false),
            "btnRadio4": new RadioButton("4 players", 500, HEIGHT / 2 - 35, 100, 24, false),
            "btnInput1up": new InputControl("grow", 190, HEIGHT / 2 + 20 , 65, 25, 0),
            "btnInput1down": new InputControl("sip", 190, HEIGHT / 2 + 55 , 65, 25, 1),
            "btnInput2up": new InputControl("grow", 265, HEIGHT / 2 + 20 , 65, 25, 2),
            "btnInput2down": new InputControl("sip", 265, HEIGHT / 2 + 55 , 65, 25, 3),
            "btnInput3up": new InputControl("grow", 340, HEIGHT / 2 + 20 , 65, 25, 4),
            "btnInput3down": new InputControl("sip", 340, HEIGHT / 2 + 55 , 65, 25, 5),
            "btnInput4up": new InputControl("grow", 415, HEIGHT / 2 + 20 , 65, 25, 6),
            "btnInput4down": new InputControl("sip", 415, HEIGHT / 2 + 55 , 65, 25, 7)        
        }       
    };

    initializeControls() {
        if (this.NbPlayers === 3) {
            ctrls = ["KeyQ", "KeyA", "KeyY", "KeyH", "ArrowUp", "ArrowDown", "KeyO", "KeyL"];
        } else if (this.NbPlayers === 4) {
            ctrls = ["KeyQ", "KeyA", "KeyR", "KeyF", "KeyO", "KeyL", "ArrowUp", "ArrowDown"];
        } else {
            ctrls = ["KeyW", "KeyS", "ArrowUp", "ArrowDown", "KeyF", "KeyC", "KeyO", "KeyL"];
        }
    }
    
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
            
            ctx.font = "20px crayon_libre";
            ctx.fillStyle = "black"
            ctx.fillText("Game setup", 730, 170);
            ctx.font = "16px crayon_libre";
            if (this.NbPlayers == 2) {
                ctx.fillText("Romeo & Juliet", 730, 270);
            }
            else if (this.NbPlayers == 3) {
                ctx.fillText("Huey, Dewey,", 730, 240);
                ctx.fillText("and Louie", 730, 270);
            }
            else {
                ctx.fillText("John, Paul,", 730, 240);
                ctx.fillText("George and Ringo", 730, 270);
            }
            ctx.fillText("Ready to play?", 730, 310);
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
        ctx.font = "20px crayon_libre";
        ctx.fillStyle = "white";
        // Titre principal
        ctx.fillText("Controls", 340, 135);
        ctx.font = "12px crayon_libre";
        ctx.textAlign = "right";
        ctx.fillText("Grow bubble", 180, HEIGHT / 2 + 35) 
        ctx.fillText("Swallow", 180, HEIGHT / 2 + 70) 
        this.BUTTONS.btnBack.render(ctx);
        this.BUTTONS.btnSlide.render(ctx);
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
        
        ctx.fillStyle = "pink";
        ctx.rotate(-Math.PI / 5)
        ctx.fillText("& Yuki", 30, 90);
        ctx.restore();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "pink";
        ctx.beginPath();
        ctx.moveTo(530, 285);
        ctx.bezierCurveTo(570, 260, 530, 250, 485, 250);
        //ctx.lineTo(570, 260);
        //ctx.lineTo(530, 250);
        //ctx.lineTo(490, 250);
        ctx.fillStyle = "pink";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(485, 250);
        ctx.lineTo(495, 245);
        ctx.lineTo(495, 255);
        ctx.closePath();
        ctx.fill();

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
    
    defocus() {
        this.BUTTONS.btnInput1up.isFocused = false;
        this.BUTTONS.btnInput1down.isFocused = false;
        this.BUTTONS.btnInput2up.isFocused = false;
        this.BUTTONS.btnInput2down.isFocused = false;
        this.BUTTONS.btnInput3up.isFocused = false;
        this.BUTTONS.btnInput3down.isFocused = false;
        this.BUTTONS.btnInput4up.isFocused = false;
        this.BUTTONS.btnInput4down.isFocused = false;
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

        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnRadio2.isAt(x,y)) { 
            this.BUTTONS.btnRadio2.updateValue(1)
            this.BUTTONS.btnRadio3.updateValue(0)
            this.BUTTONS.btnRadio4.updateValue(0)
            let tempPlayers = this.NbPlayers;
            this.NbPlayers = 2 ;
            if (tempPlayers != this.NbPlayers) {
                this.initializeControls();
            }

            return;
        }

        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnRadio3.isAt(x,y)) { 
            this.BUTTONS.btnRadio2.updateValue(0)
            this.BUTTONS.btnRadio3.updateValue(1)
            this.BUTTONS.btnRadio4.updateValue(0)
            let tempPlayers = this.NbPlayers;
            this.NbPlayers = 3 ;
            if (tempPlayers != this.NbPlayers) {
                this.initializeControls();
            }
            return;
        }

        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnRadio4.isAt(x,y)) { 
            this.BUTTONS.btnRadio2.updateValue(0)
            this.BUTTONS.btnRadio3.updateValue(0)
            this.BUTTONS.btnRadio4.updateValue(1)
            let tempPlayers = this.NbPlayers;
            this.NbPlayers = 4 ;
            if (tempPlayers != this.NbPlayers) {
                this.initializeControls();
            }
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput1up.isAt(x,y)) { 
            this.defocus();
            this.BUTTONS.btnInput1up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput1down.isAt(x,y)) { 
            this.defocus();
            this.BUTTONS.btnInput1down.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput2up.isAt(x,y)) { 
            this.defocus();
            this.BUTTONS.btnInput2up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput2down.isAt(x,y)) { 
            this.defocus();
            this.BUTTONS.btnInput2down.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput3up.isAt(x,y)) { 
            this.defocus();
            this.BUTTONS.btnInput3up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput3down.isAt(x,y)) { 
            this.defocus();
            this.BUTTONS.btnInput3down.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput4up.isAt(x,y)) { 
            this.defocus();
            this.BUTTONS.btnInput4up.isFocused = true;
            return;
        }
        if ((this.state === STATE.CONTROLS_SCREEN) && this.BUTTONS.btnInput4down.isAt(x,y) ) {
            this.defocus(); 
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

    constructor(x, y, w, h, minValue, maxValue, initialValue) {
        this.x = x;
        this.y = y;
        this.height = h;
        this.width = w;
        this.x0 = x - w/2;
        this.y0 = y;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.value = initialValue; 
        //this.handleX = this.x - this.width / 2 + ((this.value - this.minValue) / (this.maxValue - this.minValue)) * this.width;
    }

    render(ctx) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x0, this.y0);
        //ctx.lineTo(this.x0 + this.width, this.y0);
        ctx.stroke();

        for (let i=0; i <= 10; i += 1) {
            ctx.beginPath();
            ctx.moveTo(this.x0 + i * this.width / 10, this.y - 4);
            ctx.lineTo(this.x0 + i * this.width / 10, this.y + 4);
            ctx.stroke();
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(this.x0 + (i-0.5) * this.width / 10, this.y - 2);
                ctx.lineTo(this.x0 + (i-0.5) * this.width / 10, this.y + 2);
                ctx.stroke();
            }
        }

        /*
        ctx.fillStyle = "rgba(0, 191, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.handleX, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
        */
       ctx.fillStyle = "white";
       const per = (this.value - this.minValue) / (this.maxValue - this.minValue);
       ctx.beginPath();
       ctx.moveTo(this.x0 + per * this.width, this.y - 6);
       ctx.lineTo(this.x0 + per * this.width - 4, this.y - 12);
       ctx.lineTo(this.x0 + per * this.width + 4, this.y - 12);
       ctx.closePath();
       ctx.fill();

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = `${this.height*0.7}px crayon_libre`;
        let volume = Math.min(Math.round(this.value),100);
        ctx.fillText( volume + "%",this.x0 + per * this.width, this.y - 15);
        ctx.font = `${this.height}px crayon_libre`;
        ctx.fillText("Sound volume",this.x-185, this.y + 5);
        
    }

    isAt(x, y) {
        const dx = x - this.handleX;
        const dy = y - this.y;
        return x >= this.x0 && x <= this.x0 + this.width && y >= this.y0 - this.height/2 && y <= this.y0 + this.height/2;   
     }
    
    updateValue(x){
        this.value = Math.round(this.minValue + (this.maxValue - this.minValue) * (x - this.x0) / this.width / 5) * 5;
        audio.setVolume(this.value / 100);
    }

    getValue() {
        return this.value;
    }


}
class RadioButton extends Button {

    constructor(label, x, y, w, h, selected = false) {
        super(label, x, y, w, h);
        this.radius = 16; // Taille du bouton
        this.selected = selected;
    }

    render(ctx) {
        // Dessiner le cercle externe
        ctx.strokeStyle = "white"; // "rgba(255, 191, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2 + (this.height - this.radius) / 2, this.radius, this.radius);
        /*
        ctx.beginPath();
        ctx.arc(this.x + this.radius / 2, this.y + this.height / 2, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        */

        // Dessiner le label
        ctx.font = "16px crayon_libre";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(this.txt, this.x - this.width / 2 + this.radius + 10, this.y + 5);

        // Dessiner le cercle interne si sélectionné
        if (this.selected) {
            /*
            ctx.fillStyle = "rgba(173, 235, 179, 0.8)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2);
            ctx.fill();
            */
            ctx.fillText("X", this.x - this.width/2 + 4, this.y + 5);
        }

        // DEBUG: show hit box
        DEBUG && ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    /*
    isAt(x, y) {
        // Vérifier si la souris est sur ce bouton radio
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius ;
    }
    */
    
    updateValue(v){
        this.selected = v;
    }
}


class InputControl {
    constructor(label, x, y, width, height, id) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.code = ctrls[id];
        this.isFocused = false;
        this.id = id;
    }

    render(ctx) {
        // Dessiner le label
        ctx.fillStyle = "white";
        ctx.font = "12px crayon_libre";
        ctx.textAlign = "left";
        //ctx.fillText(this.label, this.x - 30, this.y + 15);
    
        if (this.id % 2 === 0) {
            let number = Math.floor(this.id / 2) + 1;
            ctx.fillText("Player " + number, this.x, this.y - 15);
        }
    
        // Dessiner la zone de saisie
        ctx.strokeStyle = this.isFocused ? "rgba(255, 172, 82, 0.8)" : "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    
        // Afficher la touche sélectionnée en temps réel à partir de `ctrls`
        ctx.fillStyle = "white";
        ctx.font = "12px crayon_libre";
        ctx.textAlign = "center";
    
        let mykey = ctrls[this.id].startsWith("Key") 
            ? ctrls[this.id].slice(3).toUpperCase() 
            : ctrls[this.id];
        mykey = { A: "Q", Q: "A", Z: "W", W: "Z" }[mykey] || mykey;
        ctx.fillText(mykey, this.x + this.width / 2, this.y + this.height / 2 + 5);
    }
    
    isAt(x, y) {
        // Vérifier si la souris est dans la zone
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    focus() {
        // Désactiver le focus pour tous les boutons
        for (let button in this.BUTTONS) {
            if (this.BUTTONS[button]) {
                this.BUTTONS[button].isFocused = false;
            }
        }
    }





    setKey(e) {
        if (this.isFocused) {
            const existingIndex = ctrls.indexOf(e.code);
    
            if (existingIndex === -1) {
                // Si la touche n'est pas utilisée, on l'assigne directement
                this.code = e.code;
                ctrls[this.id] = e.code;
            } else {
                // Si la touche est déjà utilisée, on permute
                const temp = ctrls[existingIndex];
                ctrls[existingIndex] = ctrls[this.id];
                ctrls[this.id] = temp;
                this.code = e.code;
            }
    
            this.isFocused = false;
            this.updateCtrl(); // Met à jour CONTROLS et redessine
        }
    }
    

    updateCtrl() {
        // Mettre à jour les contrôles avec les nouvelles valeurs
        CONTROLS[0] = { up: ctrls[0], down: ctrls[1] };
        CONTROLS[1] = { up: ctrls[2], down: ctrls[3] };
        CONTROLS[2] = { up: ctrls[4], down: ctrls[5] };
        CONTROLS[3] = { up: ctrls[6], down: ctrls[7] };

        render(ctx); // Redessiner après mise à jour
    }
}



export default GUI;
