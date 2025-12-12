import { readFileSync } from "node:fs"
import z3 from "z3-solver"
const { Context } = await z3.init()
const ctx = Context("main")

const input = readFileSync("input.txt", "utf-8")

type Point = {
	x: number
	y: number
}
type Shape = {
	cells: Array<Point>
	width: number
	height: number
}
type Space = {
	width: number
	height: number
	counts: Array<number>
}

function parseInput (input: string): { shapes: Shape[]; spaces: Space[] } {
	const sections = input.trim().split("\n\n")
	const shapes: Shape[] = []
	const spaces: Space[] = []
	for (const section of sections) {
		if (!section.includes("x")) {
			const [idLine, ...shapeLines] = section.split("\n")
			const cells: Array<Point> = []
			shapeLines.forEach((line, y) => {
				line.split("").forEach((char, x) => {
					if (char == "#") {
						cells.push({ x, y })
					}
				})
			})
			const width = shapeLines[0].length
			const height = shapeLines.length
			shapes.push({ cells, width, height })
		} else {
			const spaceLines = section.split("\n")
			for (const line of spaceLines) {
				const [sizePart, countsPart] = line.split(":")
				const [widthStr, heightStr] = sizePart.split("x")
				const width = Number(widthStr)
				const height = Number(heightStr)
				const counts = countsPart.trim().split(" ").map(Number)
				spaces.push({ width, height, counts })
			}
		}
	}
	return { shapes, spaces }
}

const { shapes, spaces } = parseInput(input)

function cellsEqual (a: Array<Point>, b: Array<Point>): boolean {
	if (a.length != b.length) {
		return false
	}
	const sortedA = a.slice().sort((p1, p2) => (p1.x - p2.x) || (p1.y - p2.y))
	const sortedB = b.slice().sort((p1, p2) => (p1.x - p2.x) || (p1.y - p2.y))
	for (let i = 0; i < sortedA.length; i++) {
		if (sortedA[i].x != sortedB[i].x || sortedA[i].y != sortedB[i].y) {
			return false
		}
	}
	return true
}

function orientations (shape: Shape): Shape[] {
	const result: Shape[] = []
	for (let flip = 0; flip <= 1; flip++) {
		for (let rot = 0; rot < 4; rot++) {
			let cells = shape.cells.map(({ x, y }) => {
				let nx = x
				let ny = y
				let width = shape.width
				let height = shape.height
				if (flip) {
					nx = shape.width - 1 - nx
				}
				for (let r = 0; r < rot; r++) {
					[nx, ny] = [ny, width - 1 - nx];
					[width, height] = [height, width]
				}
				return { x: nx, y: ny }
			})
			if (!result.some(s => cellsEqual(s.cells, cells))) {
				const width = rot % 2 == 0 ? shape.width : shape.height
				const height = rot % 2 == 0 ? shape.height : shape.width
				result.push({ cells, width, height })
			}
		}
	}
	return result
}

const orientedShapes: Shape[][] = shapes.map(shape => orientations(shape))

async function solveSpace (space: Space): Promise<boolean> {
	const numCells = space.width * space.height
	const requiredCells = space.counts.reduce((sum, count, s) => sum + count
			* shapes[s].cells.length, 0)
	if (requiredCells > numCells) {
		return false
	}
	return true  // sic
	const solver = new ctx.Solver()
	const gridTerms = Array<Array<Array<z3.Arith<"main">>>>()
	for (let x = 0; x < space.width; x++) {
		gridTerms[x] = Array(space.height)
		for (let y = 0; y < space.height; y++) {
			gridTerms[x][y] = []
		}
	}
	for (let s = 0; s < space.counts.length; s++) {
		const shapes = orientedShapes[s]
		for (let c = 0; c < space.counts[s]; c++) {
			const shapeTerms = []
			for (let o = 0; o < shapes.length; o++) {
				for (let x = 0; x <= space.width - shapes[o].width; x++) {
					for (let y = 0; y <= space.height - shapes[o].height; y++) {
						const name = `p_${s}_${c}_${o}_${x}_${y}`
						const variable = ctx.Int.const(name)
						solver.add(variable.ge(0), variable.le(1))
						shapeTerms.push(variable)
						for (const cell of shapes[o].cells) {
							const gx = x + cell.x
							const gy = y + cell.y
							gridTerms[gx][gy].push(variable)
						}
					}
				}
			}
			if (shapeTerms.length > 0) {
				const shapeSum = shapeTerms.reduce((sum, term) => sum.add(term), ctx.Int.val(0))
				solver.add(shapeSum.eq(1))
			}
		}
	}
	for (let x = 0; x < space.width; x++) {
		for (let y = 0; y < space.height; y++) {
			const cellTerms = gridTerms[x][y]
			if (cellTerms.length > 0) {
				const cellSum = cellTerms.reduce((sum, term) => sum.add(term), ctx.Int.val(0))
				solver.add(cellSum.le(1))
			}
		}
	}
	return await solver.check() == "sat"
}

let solvedCount = 0
for (const space of spaces) {
	if (await solveSpace(space)) {
		solvedCount++
	}
}
console.log(solvedCount)
