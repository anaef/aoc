import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")
type Operator = "+" | "*"

type Problem = {
	numbers: Array<number>
	operator: Operator
}

function parseInput1 (input: string): Array<Problem> {
	const lines = input.split(/\r?\n/).filter(Boolean).map(line => line.trim())
	const result: Array<Problem> = lines[0].split(/\s+/).map((num) => ({
		numbers: [Number(num)],
		operator: "+"
	}))
	for (let i = 1; i < lines.length - 1; i++) {
		lines[i].split(/\s+/).forEach((num, index) => {
			result[index].numbers.push(Number(num))
		})
	}
	lines[lines.length - 1].split(/\s+/).forEach((op, index) => {
		result[index].operator = op as Operator
	})
	return result
}

function grandTotal (problems: Array<Problem>): number {
	return problems.reduce((acc, problem) => {
		if (problem.operator == "+") {
			return acc + problem.numbers.reduce((a, b) => a + b, 0)
		} else {
			return acc + problem.numbers.reduce((a, b) => a * b, 1)
		}
	}, 0)
}

const problems1 = parseInput1(input)
console.log(grandTotal(problems1))

function parseInput2 (input: string): Array<Problem> {
	const lines = input.split(/\r?\n/).filter(Boolean)
	const numCols = lines[0].length
	const result: Array<Problem> = []
	const problem: Problem = { numbers: [], operator: "+" }
	for (let i = numCols - 1; i >= 0; i--) {
		const digits: Array<string> = []
		for (let j = 0; j < lines.length - 1; j++) {
			digits.push(lines[j][i])
		}
		if (digits.every(d => d == " ")) {
			continue
		}
		problem.numbers.push(Number(digits.join("").trim()))
		if (lines[lines.length - 1][i] != " ") {
			problem.operator = lines[lines.length - 1][i] as Operator
			result.push({ ...problem })
			problem.numbers = []
		}
	}
	return result.reverse()
}

const problems2 = parseInput2(input)
console.log(grandTotal(problems2))
