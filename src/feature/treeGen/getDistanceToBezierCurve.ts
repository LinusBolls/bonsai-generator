interface Pos {
    x: number;
    y: number;
}

export const getDistanceToBezierCurve = (point: Pos, curvePoints: Pos[], tolerance: number = 1e-500, maxDepth: number = 10): number => {
    const n = curvePoints.length - 1;
    if (n === 1) {
        return distancePointToLineSegment(point, curvePoints[0], curvePoints[1]);
    }

    const [left, right] = subdivideCurve(curvePoints, 0.5);
    const leftBbox = boundingBox(left);
    const rightBbox = boundingBox(right);

    if (maxDepth === 0 || (bboxSize(leftBbox) <= tolerance && bboxSize(rightBbox) <= tolerance)) {
        const leftCenter = centerOfBbox(leftBbox);
        const rightCenter = centerOfBbox(rightBbox);
        return Math.min(distanceBetweenPoints(point, leftCenter), distanceBetweenPoints(point, rightCenter));
    }

    return Math.min(
        getDistanceToBezierCurve(point, left, tolerance, maxDepth - 1),
        getDistanceToBezierCurve(point, right, tolerance, maxDepth - 1)
    );
};

const subdivideCurve = (points: Pos[], t: number): [Pos[], Pos[]] => {
    const left: Pos[] = [];
    const right: Pos[] = [];

    let workingPoints = points.slice();
    while (workingPoints.length > 0) {
        left.push(workingPoints[0]);
        right.unshift(workingPoints[workingPoints.length - 1]);

        workingPoints = workingPoints.slice(1, -1).map((p, i) => {
            return {
                x: (1 - t) * p.x + t * workingPoints[i + 1].x,
                y: (1 - t) * p.y + t * workingPoints[i + 1].y
            };
        });
    }

    return [left, right];
};

const boundingBox = (points: Pos[]): [Pos, Pos] => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of points) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }

    return [{ x: minX, y: minY }, { x: maxX, y: maxY }];
};

const bboxSize = (bbox: [Pos, Pos]): number => {
    const [min, max] = bbox;
    return Math.max(max.x - min.x, max.y - min.y);
};

const centerOfBbox = (bbox: [Pos, Pos]): Pos => {
    const [min, max] = bbox;
    return { x: (min.x + max.x) / 2, y: (min.y + max.y) / 2 };
};

const distanceBetweenPoints = (point1: Pos, point2: Pos): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
};
const distancePointToLineSegment = (point: Pos, linePoint1: Pos, linePoint2: Pos): number => {
    // calculates the closest distance between a point and a line segment defined by two points
    const dx = linePoint2.x - linePoint1.x;
    const dy = linePoint2.y - linePoint1.y;

    const lineLengthSquared = dx * dx + dy * dy;

    if (lineLengthSquared === 0) { // linePoint1 and linePoint2 are the same, treat as single point
        return distanceBetweenPoints(point, linePoint1);
    }

    const t = ((point.x - linePoint1.x) * dx + (point.y - linePoint1.y) * dy) / lineLengthSquared;

    if (t <= 0) { // point is nearest to linePoint1
        return distanceBetweenPoints(point, linePoint1);
    }
    if (t >= 1) { // point is nearest to linePoint2
        return distanceBetweenPoints(point, linePoint2);
    }

    const projectionX = linePoint1.x + t * dx;
    const projectionY = linePoint1.y + t * dy;
    const projectionPoint = { x: projectionX, y: projectionY };

    return distanceBetweenPoints(point, projectionPoint);
}