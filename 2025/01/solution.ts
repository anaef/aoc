import { readFileSync } from "node:fs"

type Direction = "L" | "R"

type Instruction = {
	turn: Direction
	distance: number
}

type Wheel = {
	position: number
	zeroes: number
}

const WHEEL_SIZE = 100
const WHEEL_START = 50

const input = readFileSync("input.txt", "utf-8")

const instructions: Instruction[] = input
	.split(/\r?\n/)
	.filter(Boolean)
	.map((line: String) => {
		const turn = line[0] as Direction
		const distance = Number(line.slice(1))
		return { turn, distance }
	})

function turn1 (wheel: Wheel, instruction: Instruction): void {
	const distance = instruction.distance % WHEEL_SIZE
	if (instruction.turn == "L") {
		wheel.position = (wheel.position - distance + WHEEL_SIZE) % WHEEL_SIZE
	} else {
		wheel.position = (wheel.position + distance) % WHEEL_SIZE
	}
	if (wheel.position == 0) {
		wheel.zeroes += 1
	}
}

const wheel: Wheel = {
	position: WHEEL_START,
	zeroes: 0
}
instructions.forEach(instruction => {
	turn1(wheel, instruction)
})
console.log(wheel.zeroes)

function turn2 (wheel: Wheel, instruction: Instruction): void {
	wheel.zeroes += Math.floor(instruction.distance / WHEEL_SIZE)
	const distance = instruction.distance % WHEEL_SIZE
	if (instruction.turn == "L") {
		if (wheel.position <= distance && wheel.position != 0) {
			wheel.zeroes += 1
		}
		wheel.position = (wheel.position - distance + WHEEL_SIZE) % WHEEL_SIZE
	} else {
		if (wheel.position + distance >= WHEEL_SIZE && wheel.position != 0) {
			wheel.zeroes += 1
		}	
		wheel.position = (wheel.position + distance) % WHEEL_SIZE
	}
}

wheel.position = WHEEL_START
wheel.zeroes = 0
instructions.forEach(instruction => {
	turn2(wheel, instruction)
})
console.log(wheel.zeroes)
