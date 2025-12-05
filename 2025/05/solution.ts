import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")

type Range = {
	min: number
	max: number
}

function parseRange (line: string): Range {
	const [min, max] = line.split("-").map(Number)
	return { min, max }
}

function parseInput (input: string): { ranges: Range[]; numbers: number[] } {
	const [rangePart, numberPart] = input.split(/\r?\n\r?\n/)
	const ranges = rangePart.split("\n").map(parseRange)
	const numbers = numberPart.split("\n").map(Number)
	return { ranges, numbers }
}

const { ranges, numbers } = parseInput(input)

function isFresh (num: number, ranges: Range[]): boolean {
	for (const range of ranges) {
		if (num >= range.min && num <= range.max) {
			return true
		}
	}
	return false
}

let freshCount = 0
for (const num of numbers) {
	if (isFresh(num, ranges)) {
		freshCount++
	}
}
console.log(freshCount)

const memo: Map<string, number> = new Map()
const key = (i: number, range: Range) => `${i}:${range.min}:${range.max}`

function overlap (i: number, range: Range): number {
	const memoKey = key(i, range)
	if (memo.has(memoKey)) {
		return memo.get(memoKey)
	}
	let result = 0
	for (let j = 0; j < i; j++) {
		const overlapRange = {
			min: Math.max(ranges[j].min, range.min),
			max: Math.min(ranges[j].max, range.max)
		}
		if (overlapRange.min <= overlapRange.max) {
			result += (overlapRange.max - overlapRange.min + 1) - overlap(j, overlapRange)
		}
	}
	memo.set(memoKey, result)
	return result
}

console.log(overlap(ranges.length, { min: -Infinity, max: Infinity }))
