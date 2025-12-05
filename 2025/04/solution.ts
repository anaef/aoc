import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")

type state = "empty" | "paper"

const grid: state[][] = input.split(/\r?\n/).filter(Boolean).map(line =>
	line.split("").map(char => char == "@" ? "paper" : "empty")
)

const numRows = grid.length
const numCols = grid[0].length

function isAccessible (row: number, col: number): boolean {
	if (grid[row][col] == "empty") {
		return false
	}
	let paperNeighbors = 0
	const directions = [
		[-1, 0], [1, 0], [0, -1], [0, 1],
		[-1, -1], [-1, 1], [1, -1], [1, 1]
	]
	for (const [dRow, dCol] of directions) {
		const newRow = row + dRow
		const newCol = col + dCol
		if (newRow >= 0 && newRow < numRows &&
			newCol >= 0 && newCol < numCols) {
			if (grid[newRow][newCol] == "paper") {
				paperNeighbors++
			}
		}
	}
	return paperNeighbors < 4
}

let accessibleCount = 0
for (let row = 0; row < numRows; row++) {
	for (let col = 0; col < numCols; col++) {
		if (isAccessible(row, col)) {
			accessibleCount++
		}
	}
}
console.log(accessibleCount)

let removedCount = 0
let removedCountBefore: number
do {
	removedCountBefore = removedCount
	for (let row = 0; row < numRows; row++) {
		for (let col = 0; col < numCols; col++) {
			if (isAccessible(row, col)) {
				grid[row][col] = "empty"
				removedCount++
			}
		}
	}
} while (removedCount > removedCountBefore)
console.log(removedCount)
