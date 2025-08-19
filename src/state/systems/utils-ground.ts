import { voxel, World } from "../world/type";

export const getChunkGridIndexAt = (world: World, x: number, y: number) => {
	const cx = Math.floor(x % world.ground.chunkSize);
	const cy = Math.floor(y % world.ground.chunkSize);

	return (cx + cy * world.ground.chunkSize) * world.ground.chunkHeight;
};

export const getChunkAt = (world: World, x: number, y: number) => {
	const chunkX = Math.floor(x / world.ground.chunkSize);
	const chunkY = Math.floor(y / world.ground.chunkSize);

	if (
		chunkX < 0 ||
		chunkX >= world.ground.sizeInChunk ||
		chunkY < 0 ||
		chunkY >= world.ground.sizeInChunk
	)
		return undefined;

	const chunk = world.ground.chunks[chunkX + chunkY * world.ground.sizeInChunk];

	return chunk;
};

export const getHeightAt = (world: World, x: number, y: number) => {
	const chunk = getChunkAt(world, x, y);
	const i = getChunkGridIndexAt(world, x, y);

	if (!chunk) return 0;

	let h = -1;
	while (
		h + 1 < world.ground.chunkHeight &&
		chunk.grid[i + h + 1] !== voxel.empty
	)
		h++;

	if (h < 0) return 0;

	const top = chunk.grid[i + h];

	if (top === voxel.sand_slope_x_negative) return h + 1 - (x % 1);
	if (top === voxel.sand_slope_x_positive) return h + (x % 1);

	if (top === voxel.sand_slope_y_negative) return h + 1 - (y % 1);
	if (top === voxel.sand_slope_y_positive) return h + (y % 1);

	return h + 1;
};
