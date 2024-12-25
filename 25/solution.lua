local input = assert(io.open("input.txt"))
local content = input:read("*a")
input:close()

local first = true
local keys, locks = { }, { }
local nx, ny
for element in string.gmatch(content .. "\n", ".-\n\n") do
	local islock, heights, maxheight
	for line in string.gmatch(element, "[^\n]+") do
		if not heights  then
			islock = string.sub(line, 1, 1) == "#"
			heights = { }
			for i = 1, string.len(line) do
				heights[i] = islock and 0 or -1
			end
			if first then
				nx = #heights
			else
				assert(#heights == nx)
			end
			maxheight = -1
		else

			for i = 1, #heights do
				heights[i] = heights[i] + (string.sub(line, i, i) == "#" and 1 or 0)
			end
			maxheight = maxheight + 1
		end
	end
	if first then
		ny = maxheight
	else
		assert(maxheight == ny)
	end
	table.insert(islock and locks or keys, heights)
	first = nil
end
print("n", #locks, #keys, nx, ny)

local function checkfit (lock, key)
	for i = 1, nx do
		if lock[i] + key[i] > ny then
			return false
		end
	end
	return true
end

local function countfit ()
	local count = 0
	for _, lock in ipairs(locks) do
		for _, key in ipairs(keys) do
			if checkfit(lock, key) then
				count = count + 1
			end
		end
	end
	return count
end

print(countfit())