import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")

type Outputs = Array<string>

function parseInput (input: string): Map<string, Outputs> {
	const result = new Map<string, Outputs>()
	for (const line of input.split(/\r?\n/).filter(Boolean)) {
		const [name, list] = line.split(":").map(s => s.trim())
		result.set(name, list ? list.split(" ").map(s => s.trim()) : [])
	}
	return result
}

function topologicalSort (devices: Map<string, Outputs>): Array<string> {
	const dependencyCounts = new Map<string, number>()
	for (const name of devices.keys()) {
		dependencyCounts.set(name, 0)
	}
	for (const outputs of devices.values()) {
		for (const output of outputs) {
			dependencyCounts.set(output, (dependencyCounts.get(output) ?? 0) + 1)
		}
	}
	const queue: Array<string> = []
	for (const [name, count] of dependencyCounts) {
		if (count == 0) {
			queue.push(name)
		}
	}
	const result: Array<string> = []
	while (queue.length > 0) {
		const name = queue.shift()
		result.push(name)
		const outputs = devices.get(name)
		if (!outputs) {
			continue
		}
		for (const output of outputs) {
			const next = dependencyCounts.get(output) - 1
			dependencyCounts.set(output, next)
			if (next == 0) {
				queue.push(output)
			}
		}
	}
	if (result.length != dependencyCounts.size) {
		throw new Error("Cycle detected")
	}
	return result
}

function countPaths (devices: Map<string, Outputs>, order: Array<string>, start: string,
		end: string, req: Array<string> = []): number {
	const stateCount = 1 << req.length
	const states = new Map<string, Array<number>>()
	const getState = (name: string) => {
		let state = states.get(name)
		if (!state) {
			state = new Array<number>(stateCount).fill(0)
			states.set(name, state)
		}
		return state
	}
	getState(start)[0] = 1
	for (const name of order) {
		if (name == end) {
			break
		}
		const counts = states.get(name)
		if (!counts) {
			continue
		}
		const outputs = devices.get(name)
		for (const output of outputs) {
			const outputState = getState(output)
			const outputMask = req.includes(output) ? 1 << req.indexOf(output) : 0
			for (let mask = 0; mask < stateCount; mask++) {
				outputState[mask | outputMask] += counts[mask]
			}
		}
	}
	return getState(end)[stateCount - 1]
}

const devices = parseInput(input)
const order = topologicalSort(devices)
console.log(countPaths(devices, order, "you", "out"))
console.log(countPaths(devices, order, "svr", "out", ["dac", "fft"]))
