

const DEBUG = false;

/**
 * Abstract class for entities
 */
export class Entity {

    /**
     * Creates a character. 
     * @param {number} x starting X
     * @param {number} y starting Y
     * @param {number} vecX starting vecX
     * @param {number} vecY starting vecY
     * @param {Array} dialog dialog line of the character
     */
    constructor(x,y,vecX,vecY) {
        /** @type {number} X position */
        this.x = x;
        /** @type {number} Y position */
        this.y = y;
        /** @type {number} X direction */
        this.vecX = vecX;
        /** @type {number} Y direction */
        this.vecY = vecY;        
    }


    //// --- Movement ----

    /**
     * Updates the character's state. 
     * @param {number} dt elapsed time since last update
     * @returns 
     */
    update(dt) {

    }


    /**
     * Checks if the current entity is hitting something that prevents from moving.  
     * @param {number} newX new X coordinate 
     * @param {number} newY new Y coordinate
     * @returns 
     */
    hitsSomething(newX, newY) {
        return false;
    }

    isVisible() {

    }


    /**
     * Renders the entity.
     * @param {CanvasRenderingContext2D} ctx the context to draw on.
     */
    render(ctx) {

    }
}
