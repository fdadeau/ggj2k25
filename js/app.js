import { preload, data } from "./loader.js";

export const WIDTH = 800, HEIGHT = 500;     // should be a ratio of 16/10

import GUI from "./gui.js";

/**
 *  Application 
 *  - loads resources 
 *  - starts GUI when ready
 */
document.addEventListener("DOMContentLoaded", function() {

    /** @type {HTMLCanvasElement} Canvas */
    const CVS = document.querySelector("canvas");
    /** @type {CanvasRenderingContext2D} Canvas 2D context */
    const CXT = CVS.getContext("2d");

    CXT.textAlign = "center";
    CXT.verticalAlign = "middle";
    CXT.font = "20px arial";
    CXT.fillStyle = "black";
    
    // GUI for game interactions
    const gui = new GUI();

    /** @type { boolean } true if all resources have been successfully loaded */ 
    let loaded = false;
    // start preload
    preload(onLoad).catch(onError);

    
    /**  
     * Callback invoked each time a resource has been loaded. 
     * @param {number} current number of loaded resources 
     * @param {number} total number of expected resources
     * @returns 
     */
    function onLoad(current, total) {
        CXT.clearRect(0, 0, WIDTH, HEIGHT);
        CXT.fillStyle = '#000';
        CXT.fillRect(0, 0, WIDTH, HEIGHT);
        CXT.fillStyle = '#fff';
        CXT.font = "bold small-caps 40px crayon_libre";
        // loading not yet completed
        if (current < total) {
            CXT.fillText(`Loading resources...`, WIDTH * 0.4, HEIGHT * 0.5);
            CXT.fillText(`(${(current / total) * 100 | 0}%)`, WIDTH * 0.75, HEIGHT * 0.5);
            return;
        }
        // loading complete!
        loaded = true;
        CXT.font = "bold small-caps 40px crayon_libre";
        CXT.drawImage(data["logoGGJ"], WIDTH - 130, HEIGHT - 130, 120, 120)
        CXT.fillText(`Resources loaded!`, WIDTH / 2, HEIGHT * 0.4);
        CXT.fillText(`Click to start game`, WIDTH / 2, HEIGHT * 0.6);
        CXT.fillText(`(double-click to go full screen)`, WIDTH / 2, HEIGHT * 0.7);
    }
    function onError(err) {
        CXT.clearRect(0, 0, WIDTH, HEIGHT);
        CXT.font = "bold small-caps 40px crayon_libre";
        CXT.textAlign = "center";
        CXT.fillText("Unable to load resource: " + err, WIDTH / 2, HEIGHT * 0.4);
        CXT.fillText("Solve the problem to start the game.", WIDTH / 2, HEIGHT * 0.6);
    }

    // last update
    let lastUpdate = Date.now();
    // game loop
    function mainloop() {
        requestAnimationFrame(mainloop);
        let now = Date.now();
        gui.update(now - lastUpdate);
        gui.render(CXT);
        lastUpdate = now;
    }


    CVS.addEventListener("click", function(e) {
        if (!loaded) {
            return;
        }
        if (gui.state < 0) {
           //goFullScreen();
            gui.start();
            mainloop();
            return;
        }

        const rect = CVS.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (WIDTH / rect.width) | 0; 
        const y = (e.clientY - rect.top) * (HEIGHT / rect.height) | 0;
        
        const r = gui.click(x, y);
    });

    CVS.addEventListener("dblclick", function(e) {
        goFullScreen(e);
    });

    document.addEventListener("keydown", function(e) {
        if (e.code === "Escape") {
            e.preventDefault();
        }
        gui.keydown(e);
    })
    document.addEventListener("keyup", function(e) {
        gui.keyup(e);
    })

    /** Polyfill for setting fullscreen display */
    function goFullScreen(e) {
        e.target.requestFullscreen && e.target.requestFullscreen() || e.target.webkitRequestFullscreen && e.target.webkitRequestFullscreen() || e.target.msRequestFullscreen && e.target.msRequestFullscreen();
    }
});
