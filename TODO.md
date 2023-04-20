interface TreeSegment {
    id: string

    parent: TreeSegment | null
    children: TreeSegment[]

    nodes: TreeNode[]

    chaikinCurve: ChaikinCurve
}
interface TreeNode {
    id: string

    isMainChild: boolean
    parent: TreeNode | null

    mainChild: TreeNode | null
    children: TreeNode[]
}
interface SegmentDistance {
    distance: number
    closestPoint: Pos
    closestPointPositionAlongSegment: number
}

// TODO: save trunkThickness on segment before rendering
// in order to do this, dings


save chaikin curve on segment

interface ChaikinCurve {
    segments: {

    }[]
}

recursively get thickness info of tree

forces that act on branches
    they want to go up
    they want to spread
    but gravity pulls them down the longer they are


    type CurveGenerationAlgorithmKey = "BEZIER_CURVE" | "CATMULL_ROM_SPLINE" | "CHAIKINS_ALGORITHM";

    type CurveGenerationAlgorithmRecord = {
      [K in CurveGenerationAlgorithmKey]: {
        id: K;
        displayName: string;
      };
    };
    
    const CurveGenerationAlgorithm: CurveGenerationAlgorithmRecord = {
      BEZIER_CURVE: {
        id: "BEZIER_CURVE",
        displayName: "Bezier curve",
      },
      CATMULL_ROM_SPLINE: {
        id: "CATMULL_ROM_SPLINE",
        displayName: "Catmull-Rom Spline",
      },
      CHAIKINS_ALGORITHM: {
        id: "CHAIKINS_ALGORITHM",
        displayName: "Chaikin's Algorithm",
      },
    } as const;
    