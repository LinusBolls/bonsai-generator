interface Pos {
    x: number;
    y: number;
}

const getDistance = (p1: Pos, p2: Pos) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

const chaikin = (points: Pos[], iterations: number) => {
    for (let i = 0; i < iterations; i++) {
        const newPoints: Pos[] = [];
        for (let j = 0; j < points.length - 1; j++) {
            const p1 = points[j];
            const p2 = points[j + 1];
            const q1 = {
                x: 0.75 * p1.x + 0.25 * p2.x,
                y: 0.75 * p1.y + 0.25 * p2.y,
            };
            const q2 = {
                x: 0.25 * p1.x + 0.75 * p2.x,
                y: 0.25 * p1.y + 0.75 * p2.y,
            };
            newPoints.push(q1);
            newPoints.push(q2);
        }
        newPoints.push(points[points.length - 1]);
        points = newPoints;
    }
    return points;
}

export const getDistanceToChaikinsCurve = (point: Pos, curvePoints: Pos[], iterations: number) => {
    const curve = chaikin(curvePoints, iterations);
    let minDistance = Number.MAX_VALUE;
    for (let i = 0; i < curve.length - 1; i++) {
        const p1 = curve[i];
        const p2 = curve[i + 1];
        const distance = getDistanceToSegment(point, p1, p2);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    return minDistance;
}

const getDistanceToSegment = (point: Pos, p1: Pos, p2: Pos) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dot = (point.x - p1.x) * dx + (point.y - p1.y) * dy;
    const lengthSq = dx * dx + dy * dy;
    let distance = Number.MAX_VALUE;
    if (lengthSq > 0) {
        const t = Math.max(0, Math.min(1, dot / lengthSq));
        const projection = {
            x: p1.x + t * dx,
            y: p1.y + t * dy,
        };
        distance = getDistance(point, projection);
    }
    return distance;
}
