import { readFileSync } from "node:fs"
const highsModule = await import("highs")
const highsLoader = highsModule.default as any as (settings?: unknown) => Promise<any>
const highs = await highsLoader({})

const input = readFileSync("input.txt", "utf-8")

type Machine = {
	lights: Array<number>
	buttons: Array<Array<number>>
	joltages: Array<number>	
}

function parseInput (input: string): Array<Machine> {
	return input.split(/\r?\n/).filter(Boolean).map(line => {
		const parts = line.match(/^\[([.#]+)\] ((?:\(\d+(?:,\d+)*\) )+)\{([\d,]+)\}$/)
		if (!parts) {
			throw new Error(`Invalid line: ${line}`)
		}
		const lights = parts[1].split("").map(c => c == "#" ? 1 : 0)
		const buttons = parts[2].trim().split(" ").map(button => {
			return button.slice(1, -1).split(",").map(Number)
		})
		const joltages = parts[3].split(",").map(Number)
		return { lights, buttons, joltages }
	})
}

function solve (buttons: Array<Array<number>>, targets: Array<number>, isBinary: boolean): number {
	const lp: string[] = []
	lp.push("Minimize")
	const objTerms = buttons.map((_, i) => `x${i}`)
	lp.push(`  obj: ${objTerms.join(" + ")}`)
	lp.push("Subject To")
	for (let i = 0; i < targets.length; i++) {
		const varTerms = buttons.map((button, j) => button.includes(i) ? `x${j}` : "")
				.filter(term => term != "")
		let lhs = varTerms.length > 0 ? varTerms.join(" + ") : "0"
		if (isBinary) {
			lhs += ` - 2 y${i}`
		}
		lp.push(`  c${i}: ${lhs} = ${targets[i]}`)
	}
	lp.push("Bounds")
	for (let i = 0; i < buttons.length; i++) {
		lp.push(`  x${i} >= 0`)
	}
	if (isBinary) {
		for (let i = 0; i < targets.length; i++) {
			lp.push(`  y${i} >= 0`)
		}
	}
	lp.push("Generals")
	const intVars = [
		...buttons.map((_, i) => `x${i}`),
		...(isBinary ? targets.map((_, i) => `y${i}`) : [])
	]
	lp.push(`  ${intVars.join(" ")}`)
	lp.push("End")
	const sol = highs.solve(lp.join("\n"))
	if (!sol || sol.Status != "Optimal") {
		throw new Error(`HiGHS did not find an optimal solution (Status=${sol?.Status})`)
	}
	return buttons.reduce((sum, _, i) => sum + sol.Columns[`x${i}`].Primal, 0)
}

const machines = parseInput(input)
console.log(machines.reduce((a, b) => a + solve(b.buttons, b.lights, true), 0))
console.log(machines.reduce((a, b) => a + solve(b.buttons, b.joltages, false), 0))
