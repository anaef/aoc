import { readFileSync } from "node:fs"
import { Queue } from "@datastructures-js/queue"

const input = readFileSync("input.txt", "utf-8")

type Circuit = {
	members: Array<Box>
}
type Box = {
	x: number
	y: number
	z: number
	circuit: Circuit
}
type Pair = {
	b1: Box
	b2: Box
	d: number
}

function parseInput (input: string): Array<Box> {
	return input.split(/\r?\n/).filter(Boolean).map(line => {
		const [x, y, z] = line.split(",").map(Number)
		const circuit = { members: [] }
		const box = { x, y, z, circuit }
		circuit.members.push(box)
		return box
	})
}

function distance (p1: Box, p2: Box): number {
	return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)
}

function pairs (boxes: Array<Box>): Queue<Pair> {
	const result: Array<Pair> = []
	for (let i = 0; i < boxes.length; i++) {
		for (let j = i + 1; j < boxes.length; j++) {
			const d = distance(boxes[i], boxes[j])
			result.push({ b1: boxes[i], b2: boxes[j], d })
		}
	}
	result.sort((a, b) => a.d - b.d)
	return Queue.fromArray(result)
}

function connect (b1: Box, b2: Box): boolean {
	if (b1.circuit == b2.circuit) {
		return false
	}
	let c1 = b1.circuit
	let c2 = b2.circuit
	for (const member of c2.members) {
		member.circuit = c1
		c1.members.push(member)
	}
	c2.members.length = 0
	return true
}

const boxes = parseInput(input)
const circuits = boxes.map(box => box.circuit)
const candidates = pairs(boxes)
const numConnections1 = boxes.length < 100 ? 10 : 1000
for (let i = 0; i < numConnections1; i++) {
	const pair = candidates.dequeue()
	connect(pair.b1, pair.b2)
}
circuits.sort((a, b) => b.members.length - a.members.length)
console.log(circuits.slice(0, 3).reduce((prod, c) => prod * c.members.length, 1))

let pair2 = undefined
while (!candidates.isEmpty()) {
	const pair = candidates.dequeue()
	if (connect(pair.b1, pair.b2)) {
		pair2 = pair
	}
}
console.log(pair2.b1.x * pair2.b2.x)
