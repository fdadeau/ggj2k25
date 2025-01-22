
import { Entity } from "../entity.js";


/******************************************************************
 *              Class representing bubbles
 ******************************************************************/
const BUBBLE_STATES = { GROWING: 0, DECREASING: 1, STABLE: 2, EXPLODING: 3, EXPLODED: -1 };

const EXPLOSION_DELAY = 1000;

const SPEED_INC = 0.02, SPEED_DEC = 0.03;

const MAX_SPEED = 0.03;
const ACC = 0.001;

export class Bubble extends Entity {

    constructor(factory) {
        super(factory.x, factory.y, 0, 0);
        this.state = BUBBLE_STATES.GROWING;
        this.radius = 0;
        this.speed = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.color = factory.color;
        this.maxRadius = Infinity;
        this.creator = factory;
    }

    grow() {
        this.state = BUBBLE_STATES.GROWING;
    }
    isGrowing() {
        return this.state === BUBBLE_STATES.GROWING;
    }

    stop() {
        if (this.radius < 300) {
            this.state = BUBBLE_STATES.DECREASING;
            return;
        }
        this.state = BUBBLE_STATES.STABLE;
        this.vecY = -1;
        this.speed.x = MAX_SPEED;
    }

    dec() {
        this.state = BUBBLE_STATES.DECREASING;
    }
    isDecreasing() {
        return this.state == BUBBLE_STATES.DECREASING;
    }

    explode() {
        this.state = BUBBLE_STATES.EXPLODING;
        this.delay = EXPLOSION_DELAY;
    }

    update(dt) {
        // movement
        if (this.state == BUBBLE_STATES.STABLE) {

            if (this.vecX != 0) {
                this.speed.x += ACC * dt;
                if (this.speed.x >= MAX_SPEED) {
                    this.speed.x = MAX_SPEED;
                }
            }
            else {
                this.speed.x -= ACC * dt;
                if (this.speed.x < 0) {
                    this.speed.x = 0;
                }
            }

            if (this.vecY != 0) {
                this.speed.y += ACC * dt;
                if (this.speed.y >= MAX_SPEED) {
                    this.speed.y = MAX_SPEED;
                }
            }
            else {
                this.speed.y -= ACC * dt;
                if (this.speed.y < 0) {
                    this.speed.y = 0;
                }
            }
            
            this.y += this.speed.y * dt;
            this.x += this.speed.x * dt;
            return;
        }

        // GROWING bubble
        if (this.state === BUBBLE_STATES.GROWING) {
            if (this.radius < this.creator.opening || Math.abs(this.x - this.creator.x) > this.radius*1.5) {
                this.radius += SPEED_INC * dt;
            }
            else {
                this.x += SPEED_INC * dt;
            }
            return;
        }

        // DECREASING 
        if (this.state == BUBBLE_STATES.DECREASING) {
            if (this.radius < this.creator.opening || Math.abs(this.x - this.creator.x) > this.radius*1.5) {
                this.radius -= SPEED_DEC * dt;
                if (this.radius < 0) {
                    this.radius = 0;
                    this.state = BUBBLE_STATES.EXPLODED;
                }
            }
            else {
                this.x -= SPEED_DEC * dt;
                if (this.x < this.creator.x) {
                    this.x = this.creator.x;
                }
            }
            return;
        }
        
    }

    render(ctx) {
        const saveFillStyle = ctx.fillStyle;
        
        ctx.fillStyle = this.color.content; // Couleur de la bulle (bleu clair avec transparence)

        const X = this.creator.x;
        const Y = this.creator.y;       

        // if bubble is starting being created
        ctx.strokeStyle = this.color.border; 

        // simple case : no creation of the bubble
        if (this.state === BUBBLE_STATES.STABLE) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            return;
        }
            
        if (this.radius < this.creator.opening) {
            ctx.beginPath();
            ctx.ellipse(this.creator.x, this.creator.y, this.radius, this.creator.opening, 0, -Math.PI/2, Math.PI/2);
            ctx.stroke();
            ctx.fill();
            return;
        }

        const Yt = Y - this.creator.opening;
        const Yb = Y + this.creator.opening;

        // if bubble is larger than the radius
        if (this.radius <= this.maxRadius) {
            const dX = this.radius/2;
            ctx.beginPath();
            ctx.moveTo(X,Yt); 
            ctx.bezierCurveTo(X + dX, Yt, this.x - dX, this.y - this.radius, this.x, this.y - this.radius); // La courbe de Bézier
            ctx.arc(this.x, this.y, this.radius, -0.5*Math.PI, 0.5*Math.PI);
            ctx.bezierCurveTo(this.x - dX, this.y + this.radius, X + dX, Yb, X, Yb);
            ctx.stroke();
            ctx.fill();
        }
        ctx.fillStyle = saveFillStyle;

    }

}

export class BubbleFactory extends Entity {

    constructor(x, y, height, width, color) {
        super(x,y,0,0);
        this.x = x;
        this.y = y; 
        this.height = height;
        this.width = width;
        this.opening = height;
        this.color = color;
    }

    render(ctx) {
        ctx.strokeStyle = "black";
        ctx.fillStyle = this.color.content;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 4, this.opening, 0, 0, 2*Math.PI);
        ctx.moveTo(this.x, this.y + this.opening);
        ctx.lineTo(this.x, this.y + this.opening + 30);
        ctx.fill();
        ctx.stroke();
    }

    makeBubble() {
        return new Bubble(this);
    }

}