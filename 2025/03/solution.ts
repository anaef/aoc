import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")

const banks: Array<string> = input.split(/\r?\n/).filter(Boolean)

function maxJoltage1 (bank: string): number {
	let result = 0
	for (let i = 0; i < bank.length - 1; i++) {
		for (let j = i + 1; j < bank.length; j++) {
			const joltage = Number(`${bank[i]}${bank[j]}`)
			if (joltage > result) {
				result = joltage
			}
		}
	}
	return result
}

let totalMaxJoltage = 0
for (const bank of banks) {
	totalMaxJoltage += maxJoltage1(bank)
}
console.log(totalMaxJoltage)

function maxJoltage2 (bank: string, toggles: number): number {
	const stack: Array<string> = []
	for (let i = 0; i < bank.length; i++) {
		const battery = bank[i]
		while (stack.length > 0 && stack[stack.length - 1] < battery
				&& stack.length - 1 + (bank.length - i) >= toggles) {
			stack.pop()
		}
		if (stack.length < toggles) {
			stack.push(battery)
		}
	}
	return Number(stack.join(""))
}

totalMaxJoltage = 0
for (const bank of banks) {
	totalMaxJoltage += maxJoltage2(bank, 12)
}
console.log(totalMaxJoltage)
