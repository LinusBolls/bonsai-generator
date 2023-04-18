

import { getDistanceToBezierCurve } from "@/src/feature/treeGen/getDistanceToBezierCurve";
import { getDistanceToCatmullRomSpline } from "@/src/feature/treeGen/getDistanceToCatmullRomSpline";
import { getDistanceToChaikinsCurve } from "@/src/feature/treeGen/getDistanceToChaikinsCurve";
import { useEffect, useRef, useState } from "react"

import randomSeed from "random-seed"

const CurveGenerationAlgorithm = {
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
}

interface TreeSegment {
  nodes: TreeNode[]
}

const MAX_SIDE_BRANCHES = 3

const getAngle = (pos1: Pos, pos2: Pos): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;

  return Math.atan2(dy, dx);
}
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getNodeAngle = (node1: TreeNode | null, node2: TreeNode | null) => {

  if (!node1 || !node2) return 0

  return getAngle(node1.pos, node2.pos)
}

const getMainBranchProb = (node: TreeNode) => {

  if (node.length > 10) return 0

  if (node.length < 7) return 1

  return 0.9
}
const getSideBranchProb = (node: TreeNode) => {

  if (node.length > 12) return 0

  if (node.length < 5) return 0

  return 0.1
}

const getMainBranchLength = (node: TreeNode) => {
  return 20
}
const getSideBranchLength = (node: TreeNode) => {
  return 50
}

const getMainBranchAngle = (node: TreeNode) => {

  const up = -90

  const variance = 30

  return getRandomInt(up - variance, up + variance)
}
const getSideBranchAngle = (node: TreeNode) => {

  const up = -90

  const variance = 90

  return getRandomInt(up - variance, up + variance)
}

interface Pos {
  x: number
  y: number
}
interface TreeNode {
  parent: TreeNode | null
  mainChild: TreeNode | null
  children: TreeNode[]

  isMainChild: boolean

  pos: Pos
  length: number
}

const degreesToRadians = (degrees: number) => degrees * Math.PI / 180

const getNextPos = (pos: Pos, length: number, angle: number): Pos => {

  const x = pos.x + length * Math.cos(degreesToRadians(angle));
  const y = pos.y + length * Math.sin(degreesToRadians(angle));

  return { x, y };
}



function drawDebugCircle(ctx: CanvasRenderingContext2D, pos: { x: number, y: number }, color = "tomato") {

  const DEBUG_CIRCLE_RADIUS = 8

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, DEBUG_CIRCLE_RADIUS, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'white';
  ctx.stroke();
}

export default function Page() {

  const [curveGenAlgo, setCurveGenAlgo] = useState<typeof CurveGenerationAlgorithm[keyof typeof CurveGenerationAlgorithm]>(CurveGenerationAlgorithm.CHAIKINS_ALGORITHM)

  const [treeRandomnessSeed, setTreeRandomnessSeed] = useState<string>(getRandomString(9))

  function randomiseTreeRandomnessSeed() {

    setTreeRandomnessSeed(getRandomString(9))
  }

  const generator = randomSeed.create(treeRandomnessSeed)

  const getRandomFloat = () => generator(1000) / 1000

  const [nodes, setNodes] = useState<TreeNode[]>([])
  const [segments, setSegments] = useState<TreeSegment[]>([])

  const getNextNodes = (node: TreeNode) => {

    if (getRandomFloat() < getMainBranchProb(node)) {
      // generate main branch
      node.mainChild = {
        isMainChild: true,
        parent: node,
        mainChild: null,
        children: [],

        pos: getNextPos(node.pos, getMainBranchLength(node), getNodeAngle(node, node.parent) + getMainBranchAngle(node)),
        length: node.length + 1,
      }
      setNodes(prev => [...prev, node.mainChild])
    } else {
      // if no main branch is generated aka end of branch

      const newSegment = {
        nodes: recursivelyGetAllMainNodes(node),
      }
      setSegments(prev => [...prev, newSegment])
    }
    // else {
    //   if (node.length > 15) return
    //   // make sure to generate at least one side branch
    //   const branch = {
    //     parent: node,
    //     mainChild: null,
    //     children: [],
    //     isMainChild: false,

    //     pos: getNextPos(node.pos, getSideBranchLength(node), getNodeAngle(node, node.parent) + getSideBranchAngle(node)),
    //     length: node.length + 1,
    //   }
    //   setSegments(prev => [...prev, { nodes: recursivelyGetAllMainNodes(branch) }])
    //   node.children.push(branch)
    // }

    // generate side branches

    for (let i = 0; i < MAX_SIDE_BRANCHES; i++) {
      if (getRandomFloat() < getSideBranchProb(node)) {

        const branch = {
          parent: node,
          mainChild: null,
          children: [],
          isMainChild: false,

          pos: getNextPos(node.pos, getSideBranchLength(node), getNodeAngle(node, node.parent) + getSideBranchAngle(node)),
          length: node.length + 1,
        }
        node.children.push(branch)

        setNodes(prev => [...prev, branch])
      }
    }
    if (node.mainChild) {
      getNextNodes(node.mainChild)
    }
    for (const child of node.children) {
      getNextNodes(child)
    }
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function generateTree() {

    const ctx = canvasRef.current!.getContext("2d")!

    const canvasWidth = canvasRef.current!.width
    const canvasHeight = canvasRef.current!.height

    const startPos = {
      x: canvasWidth / 2,
      y: canvasHeight,
    }

    const startNode: TreeNode = {
      parent: null,
      mainChild: null,
      children: [],

      isMainChild: false,

      pos: startPos,
      length: 0,
    }

    // generate tree
    getNextNodes(startNode)
  }
  useEffect(() => {
    generateTree()
  }, [treeRandomnessSeed])

  useEffect(() => {

    const ctx = canvasRef.current!.getContext("2d")!

    const canvasWidth = canvasRef.current!.width
    const canvasHeight = canvasRef.current!.height

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    const drawNodeDebug = (node: TreeNode | null) => {

      if (node == null) return

      drawDebugCircle(ctx, node.pos)

      for (const child of [node.mainChild, ...node.children]) {
        if (child != null) console.log(child)
        drawNodeDebug(child)
      }
    }

    const pixelSize = 3

    for (let x = 0; x < canvasWidth; x += pixelSize) {
      for (let y = 0; y < canvasHeight; y += pixelSize) {
        const pos = { x, y }

        const closestBranchDistance = (() => {
          if (curveGenAlgo.id === CurveGenerationAlgorithm.BEZIER_CURVE.id) {
            return segments.map(segment => getDistanceToBezierCurve(pos, segment.nodes.map(i => i.pos), 1)).sort((a, b) => a - b)[0]
          }
          if (curveGenAlgo.id === CurveGenerationAlgorithm.CHAIKINS_ALGORITHM.id) {
            return segments.map(segment => getDistanceToChaikinsCurve(pos, segment.nodes.map(i => i.pos), 1)).sort((a, b) => a - b)[0]
          }
          if (curveGenAlgo.id === CurveGenerationAlgorithm.CATMULL_ROM_SPLINE.id) {
            return segments.map(segment => getDistanceToCatmullRomSpline(pos, segment.nodes.map(i => i.pos), 1)).sort((a, b) => a - b)[0]
          }
          throw new Error("invalid curve generation algorithm")
        })()

        if (closestBranchDistance < 5) {
          // draw pixel
          // ctx.fillStyle = `rgba(0, 0, 0, ${(closestBranchDistance / 5)})`

          ctx.fillStyle = "green"

          ctx.fillRect(x, y, pixelSize, pixelSize)
        }
      }
    }
    // drawNodeDebug(nodes[0])
  }, [segments, curveGenAlgo, nodes])

  return <div>
    <canvas ref={canvasRef} width="512" height="512" className="bg-red-100" />

    <select defaultValue={curveGenAlgo.id} onChange={e => {

      setCurveGenAlgo(CurveGenerationAlgorithm[e.target.value])
    }}>
      {Object.values(CurveGenerationAlgorithm).map(algo => <option value={algo.id}>{algo.displayName}</option>)}
    </select>
    <button onClick={randomiseTreeRandomnessSeed}>New seed</button>

    <span>{nodes.length} nodes</span>
    <span>{segments.length} segments</span>

    <ul>
      {segments.map(segment => <li className="font-bold">
        <h3>Branch ({segment.nodes.length})</h3>
        <ol>
          {segment.nodes.map(node =>
            <li className="flex pl-3 font-light">{Math.floor(node.pos.x)} | {Math.floor(node.pos.y)}</li>
          )}
        </ol>
      </li>
      )}
    </ul>
  </div>
}


// TODO: smooth branches (bezier curves instead of linear, thickness values)
// TODO: color pixel based on light direction
// TODO: make branches end in pointy bits

const recursivelyGetAllMainNodes = (node: TreeNode): TreeNode[] => {
  const mainNodes: TreeNode[] = [];

  const traverse = (currentNode: TreeNode): void => {

    if (!currentNode.isMainChild) {

      // if (!currentNode.parent) { // bottom of stem

      //   mainNodes.push(currentNode)
      // }
      mainNodes.push(currentNode)

      if (currentNode.parent) mainNodes.push(currentNode.parent)

      return
    }
    mainNodes.push(currentNode)

    if (!currentNode.parent) {
      throw new Error("mainChild node must have parent")
    }
    traverse(currentNode.parent)
  };
  traverse(node);

  return mainNodes;
};

function getRandomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;

  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}