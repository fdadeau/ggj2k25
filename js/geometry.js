
/**
 * Utility class managing geometry issues
 */

export { collides2D, isPointOnHVSegment, hitboxCollision, vectorOnWall, distanceSQ };

/**
 * Checks the intersection of two 2D segments defined by a point and a direction
 * @param {*} h1 first vector { x, y, vx, vy } 
 * @param {*} h2 second 
 * @returns 
 */
function collides2D(h1, h2) {
  
    if (h1.vx * h2.vy == h1.vy * h2.vx) {
        return null; // no intersection 
    }
    
    let d = h1.vx * h2.vy - h1.vy * h2.vx;
  
    let b0 = h1.vx * h1.y - h1.vy * h1.x;
    let b1 = h2.vx * h2.y - h2.vy * h2.x;
  
    let x = (h2.vx * b0 - h1.vx * b1) / d;
    let y = (h2.vy * b0 - h1.vy * b1) / d;
  
    return [x, y];
};

function isPointOnHVSegment([x,y],[x1,y1,x2,y2]) {
    return  x == x1 && x1 == x2 && (y >= y1 && y <= y2 || y >= y2 && y <= y1) ||    // vertical segment
            y == y1 && y1 == y2 && (x >= x1 && x <= x2 || x >= x2 && x <= x1);      // horiontal segment
}


function vectorOnWall(vector, wall) {
    const point = collides2D(vector, { x: wall[0], y: wall[1], vx: wall[2] - wall[0], vy: wall[3] - wall[1] });
    return point !== null && isPointOnHVSegment(point,wall) ? point : null;

}

function hitboxCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
    return !(x2 < x3 || x1 > x4 || y2 < y3 || y1 > y4);
}


/**
 * Utility function computes the distance (squared to avoid heavy Math.sqrt usage)
 * @param {number} x1 X-coordinate of the first point 
 * @param {number} y1 Y-coordinate of the first point
 * @param {number} x2 X-coordinate of the second point
 * @param {number} y2 Y-coordinate of the second point
 * @returns 
 */
function distanceSQ(x1,y1,x2,y2) {
    return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}



/*
float sign (fPoint p1, fPoint p2, fPoint p3)
{
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

bool PointInTriangle (fPoint pt, fPoint v1, fPoint v2, fPoint v3)
{
    float d1, d2, d3;
    bool has_neg, has_pos;

    d1 = sign(pt, v1, v2);
    d2 = sign(pt, v2, v3);
    d3 = sign(pt, v3, v1);

    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}
*/


