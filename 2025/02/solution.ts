import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")

interface NumberRange extends Array<number> {
	0: number
	1: number
	length: 2
}

const ranges: NumberRange[] = input.split(",").map((part: string): NumberRange => {
	const [start, end] = part.split("-").map(Number)
	return [start, end] as NumberRange
})

function isInvalid1 (number: number): boolean {
	const str = number.toString()
	if (str.length % 2 == 1) {
		return false
	}
	const half = str.length / 2
	return str.slice(0, half) == str.slice(half)
}

let invalidSum = 0
for (const [start, end] of ranges) {
	for (let num = start; num <= end; num++) {
		if (isInvalid1(num)) {
			invalidSum += num
		}
	}
}
console.log(invalidSum)

function isInvalid2 (number: number): boolean {
	const str = number.toString()
	const half = Math.floor(str.length / 2)
	for (let i = 1; i <= half; i++) {
		const remainder = str.length - i
		if (remainder % i != 0) {
			continue
		}
		const count = str.length / i
		const pattern = str.slice(0, i)
		if (pattern.repeat(count) == str) {
			return true
		}
	}
	return false
}

invalidSum = 0

for (const [start, end] of ranges) {
	for (let num = start; num <= end; num++) {
		if (isInvalid2(num)) {
			invalidSum += num
		}
	}
}
console.log(invalidSum)
