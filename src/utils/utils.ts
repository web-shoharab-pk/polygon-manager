 // Improved polygon intersection check using line segment intersection
 const doLineSegmentsIntersect = (
  p1: number[],
  p2: number[],
  p3: number[],
  p4: number[]
) => {
  const ccw = (A: number[], B: number[], C: number[]) => {
    return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
  };
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
};

export const checkPolygonIntersection = (
  newPolygon: number[][],
  existingPolygons: any[]
) => {
  // Check each existing polygon
  for (const polygon of existingPolygons) {
    const existingCoords = polygon.coordinates;

    // Check each line segment of new polygon against each line segment of existing polygon
    for (let i = 0; i < newPolygon.length; i++) {
      const i2 = (i + 1) % newPolygon.length;
      const line1Start = newPolygon[i];
      const line1End = newPolygon[i2];

      for (let j = 0; j < existingCoords.length; j++) {
        const j2 = (j + 1) % existingCoords.length;
        const line2Start = existingCoords[j];
        const line2End = existingCoords[j2];

        if (
          doLineSegmentsIntersect(line1Start, line1End, line2Start, line2End)
        ) {
          return true;
        }
      }
    }

    // Check if one polygon is completely inside the other
    const isPointInPolygon = (point: number[], polygon: number[][]) => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0],
          yi = polygon[i][1];
        const xj = polygon[j][0],
          yj = polygon[j][1];
        const intersect =
          yi > point[1] !== yj > point[1] &&
          point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Check if any point of new polygon is inside existing polygon
    if (newPolygon.some((point) => isPointInPolygon(point, existingCoords))) {
      return true;
    }

    // Check if any point of existing polygon is inside new polygon
    if (
      existingCoords.some((point: number[]) =>
        isPointInPolygon(point, newPolygon)
      )
    ) {
      return true;
    }
  }
  return false;
};