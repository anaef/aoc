import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf-8")

type Point = {
	x: number
	y: number
}
type Edge = {
	a: Point
	b: Point
}

function parseInput (input: string): Array<Point> {
	return input.split(/\r?\n/).filter(Boolean).map(line => {
		const [x, y] = line.split(",").map(Number)
		return { x, y }
	})
}

function area (p1: Point, p2: Point): number {
	return (Math.abs(p1.x - p2.x) + 1) * (Math.abs(p1.y - p2.y) + 1)
}

let maxArea1 = 0
const points = parseInput(input)
for (let i = 0; i < points.length; i++) {
	for (let j = i + 1; j < points.length; j++) {
		const a = area(points[i], points[j])
		if (a > maxArea1) {
			maxArea1 = a
		}
	}
}
console.log(maxArea1)

function orientation (e: Edge, p: Point): number {
	return Math.sign((e.b.x - e.a.x) * (p.y - e.a.y) - (e.b.y - e.a.y) * (p.x - e.a.x))
}

function pointOnEdge (p: Point, e: Edge): boolean {
	if (orientation(e, p) != 0) {
		return false
	}
	return p.x >= Math.min(e.a.x, e.b.x) && p.x <= Math.max(e.a.x, e.b.x)
			&& p.y >= Math.min(e.a.y, e.b.y) && p.y <= Math.max(e.a.y, e.b.y)
}

function pointInPolygon (p: Point, polygon: Array<Edge>): boolean {
	for (const edge of polygon) {
		if (pointOnEdge(p, edge)) {
			return true
		}
	}
	let crossings = 0
	for (const edge of polygon) {
		if ((edge.a.y > p.y) == (edge.b.y > p.y)) {
			continue
		}
		if (edge.a.x + (p.y - edge.a.y) * ((edge.b.x - edge.a.x) / (edge.b.y - edge.a.y)) > p.x) {
			crossings++
		}	
	}
	return crossings % 2 == 1
}

function edgeIntersection (e1: Edge, e2: Edge): boolean {
	const o1 = orientation(e1, e2.a)
	const o2 = orientation(e1, e2.b)
	const o3 = orientation(e2, e1.a)
	const o4 = orientation(e2, e1.b)
	return o1 != 0 && o2 != 0 && o3 != 0 && o4 != 0 && o1 != o2 && o3 != o4
}

function rectWithinPolygon (loc1: Point, loc2: Point, polygon: Array<Edge>): boolean {
	const corners = [
		{ x: loc1.x, y: loc1.y },
		{ x: loc2.x, y: loc1.y },
		{ x: loc2.x, y: loc2.y },
		{ x: loc1.x, y: loc2.y }
	]
	for (const corner of corners) {
		if (!pointInPolygon(corner, polygon)) {
			return false
		}
	}
	for (let i = 0; i < corners.length; i++) {
		const edge1 = { a: corners[i], b: corners[(i + 1) % corners.length] }
		for (const edge2 of polygon) {
			if (edgeIntersection(edge1, edge2)) {
				return false
			}
		}
	}
	return true
}

let maxArea2 = 0
const polygon: Array<Edge> = []
for (let i = 0; i < points.length; i++) {
	polygon.push({ a: points[i], b: points[(i + 1) % points.length] })
}
for (let i = 0; i < points.length; i++) {
	for (let j = i + 1; j < points.length; j++) {
		const a = area(points[i], points[j])
		if (a > maxArea2 && rectWithinPolygon(points[i], points[j], polygon)) {
			maxArea2 = a
		}
	}
}
console.log(maxArea2)
