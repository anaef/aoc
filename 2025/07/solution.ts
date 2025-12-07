import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")

type Cell = "empty" | "splitter" | "start" | "beam"
type Grid = {
	cells: Array<Array<Cell>>
	numRows: number
	numCols: number
}
type Location = {
	row: number,
	col: number
}

function parseInput (input: string): Grid {
	const cells = input.split(/\r?\n/).filter(Boolean).map(line => line.split("").map(char => {
		switch (char) {
		case ".": return "empty"
		case "^": return "splitter"
		case "S": return "start"
		default: throw new Error(`Unknown character: ${char}`)
		}
	}))
	return {
		cells,
		numRows: cells.length,
		numCols: cells[0].length
	}
}

function findStart (grid: Grid): Location {
	return {
		row: 0,
		col: grid.cells[0].findIndex(cell => cell == "start")
	}
}

function countSplits (grid: Grid): number {
	let result = 0
	const queue = Array<Location>()
	queue.push(findStart(grid))
	while (queue.length > 0) {
		const loc = queue.shift()!
		if (loc.row >= grid.numRows || loc.col < 0 || loc.col >= grid.numCols) {
			continue
		}
		const cell = grid.cells[loc.row][loc.col]
		switch (cell) {
		case "empty":
		case "start":
			grid.cells[loc.row][loc.col] = "beam"
			queue.push({ row: loc.row + 1, col: loc.col })
			break
		case "splitter":
			result++
			grid.cells[loc.row][loc.col] = "beam"
			queue.push({ row: loc.row + 1, col: loc.col - 1 })
			queue.push({ row: loc.row + 1, col: loc.col + 1 })
			break
		case "beam":
			break
		default:
			throw new Error(`Unknown cell type: ${cell}`)
		}
	}
	return result
}

const grid1 = parseInput(input)
console.log(countSplits(grid1))

function countTimelines (grid: Grid): number {
	let currentRow = new Map<number, number>([[findStart(grid).col, 1]])
	for (let row = 1; row < grid.numRows; row++) {
		const nextRow = new Map<number, number>()
		const add = (col: number, count: number) => {
			if (col < 0 || col >= grid.numCols) {
				return
			}
			nextRow.set(col, (nextRow.get(col) ?? 0) + count)
		}
		for (const [col, count] of currentRow) {
			const cell = grid.cells[row][col]
			switch (cell) {
			case "empty":
			case "start":
				add(col, count)
				break
			case "splitter":
				add(col - 1, count)
				add(col + 1, count)
				break
			default:
				throw new Error(`Unknown cell type: ${cell}`)
			}
		}
		currentRow = nextRow
	}
	return [...currentRow.values()].reduce((a, b) => a + b, 0)
}

const grid2 = parseInput(input)
console.log(countTimelines(grid2))
