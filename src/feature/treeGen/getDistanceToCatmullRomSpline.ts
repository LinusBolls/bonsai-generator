interface Pos {
  x: number;
  y: number;
}

export const getDistanceToCatmullRomSpline = (point: Pos, curvePoints: Pos[], tolerance: number = 1e-3): number => {
  const n = curvePoints.length - 1;
  let minDistance = Infinity;

  if (n < 2) {
    return distanceBetweenPoints(point, curvePoints[0]);
  }

  // Compute the Catmull-Rom spline control points
  const controlPoints = [];
  for (let i = 1; i < n; i++) {
    const p0 = curvePoints[i - 1];
    const p1 = curvePoints[i];
    const p2 = curvePoints[i + 1];
    const t = 0.5;
    const d1 = distanceBetweenPoints(p0, p1);
    const d2 = distanceBetweenPoints(p1, p2);
    const m1 = (1 - t) * (d2 / (d1 + d2)) * (p1 - p0) + t * (d1 / (d1 + d2)) * (p2 - p1);
    const m2 = (1 - t) * (d1 / (d1 + d2)) * (p2 - p1) + t * (d2 / (d1 + d2)) * (p1 - p0);
    controlPoints.push({
      p0,
      p1,
      m1,
      m2
    });
  }



  // Compute the distance to each curve segment
  for (let i = 0; i < controlPoints.length; i++) {
    const segment = controlPoints[i];
    const segmentPoints = [];
    for (let t = 0; t <= 1; t += tolerance) {
      const pointOnSegment = calculatePointOnCatmullRomSpline(segment.p0, segment.p1, segment.m1, segment.m2, t);
      segmentPoints.push(pointOnSegment);
    }
    const minSegmentDistance = distanceToLineSegment(point, segmentPoints);
    if (minSegmentDistance < minDistance) {
      minDistance = minSegmentDistance;
    }
  }

  return minDistance;
};

// Helper function to calculate a point on a Catmull-Rom spline
const calculatePointOnCatmullRomSpline = (p0, p1, m1, m2, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  const h1 = 2 * t3 - 3 * t2 + 1;
  const h2 = -2 * t3 + 3 * t2;
  const h3 = t3 - 2 * t2 + t;
  const h4 = t3 - t2;
  return h1 * p1 + h2 * p1 + h3 * m1 + h4 * m2;
};

const distanceBetweenPoints = (point1: Pos, point2: Pos): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};
const distanceToLineSegmentt = (point: Pos, linePoint1: Pos, linePoint2: Pos): number => {
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

const distanceToLineSegment = (point: Pos, segmentPoints: Pos[]): number => {
  let minDistance = Infinity;
  for (let i = 0; i < segmentPoints.length - 1; i++) {
    const segmentStart = segmentPoints[i];
    const segmentEnd = segmentPoints[i + 1];
    const distance = distanceToLineSegmentt(point, segmentStart, segmentEnd);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  return minDistance;
};


