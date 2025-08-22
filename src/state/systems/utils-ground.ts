import { vec3, vec4 } from "gl-matrix";
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

export const getNormalAt = (
	out: { y: number; normal: vec3 },
	world: World,
	x: number,
	y: number,
) => {
	const chunk = getChunkAt(world, x, y);
	const i = getChunkGridIndexAt(world, x, y);

	vec3.set(out.normal, 0, 0, 1);
	out.y = 0;

	if (!chunk) return;

	let h = -1;
	while (
		h + 1 < world.ground.chunkHeight &&
		chunk.grid[i + h + 1] !== voxel.empty
	)
		h++;

	if (h < 0) return;

	const top = chunk.grid[i + h];

	if (top === voxel.sand_slope_x_negative) {
		out.y = (h + 1 - (x % 1)) * world.ground.voxelHeight;
		out.normal[0] = 1;
		out.normal[2] = world.ground.voxelHeight;
		vec3.normalize(out.normal, out.normal);
	} else if (top === voxel.sand_slope_x_positive) {
		out.y = h + (x % 1) * world.ground.voxelHeight;
		out.normal[0] = -1;
		out.normal[2] = -world.ground.voxelHeight;
		vec3.normalize(out.normal, out.normal);
	} else if (top === voxel.sand_slope_y_negative) {
		out.y = (h + 1 - (y % 1)) * world.ground.voxelHeight;
		out.normal[1] = 1;
		out.normal[2] = -world.ground.voxelHeight;
		vec3.normalize(out.normal, out.normal);
	} else if (top === voxel.sand_slope_y_positive) {
		out.y = (h + (y % 1)) * world.ground.voxelHeight;
		out.normal[1] = -1;
		out.normal[2] = -world.ground.voxelHeight;
		vec3.normalize(out.normal, out.normal);
	} else {
		out.y = (h + 1) * world.ground.voxelHeight;
		vec3.set(out.normal, 0, 0, 1);
	}
};

export const getVoxelAt = (world: World, x: number, y: number, z: number) => {
	const chunk = getChunkAt(world, x, y);
	const i = getChunkGridIndexAt(world, x, y);

	const uz = Math.floor(z);

	if (uz < 0) return voxel.rock_cube;

	return chunk && 0 <= uz && uz <= world.ground.chunkHeight
		? chunk.grid[i + uz]
		: voxel.empty;
};

export const getSphereCollision = (
	world: World,
	sphereCenter: vec3,
	sphereRadius: number,
) => {
	const collisions = [];

	for (
		let x = Math.floor(sphereCenter[0] - sphereRadius);
		x <= Math.floor(sphereCenter[0] + sphereRadius);
		x++
	) {
		for (
			let y = Math.floor(sphereCenter[1] - sphereRadius);
			y <= Math.floor(sphereCenter[1] + sphereRadius);
			y++
		) {
			for (
				let z = Math.floor(sphereCenter[2] - sphereRadius);
				z <= Math.floor(sphereCenter[2] + sphereRadius);
				z++
			) {
				const v = getVoxelAt(world, x, y, z);

				if (v === voxel.sand_cube) {
					const planes: vec4[] = [
						[1, 0, 0, x + 1],
						[-1, 0, 0, -x],
						[0, 1, 0, y + 1],
						[0, -1, 0, -y],
						[0, 0, 1, z + 1],
						[0, 0, -1, -z],
					];

					for (const plane of planes) {
						if (
							getVoxelAt(world, x + plane[0], y + plane[1], z + plane[2]) !==
							voxel.empty
						)
							continue;

						const distanceToPlan =
							plane[0] * sphereCenter[0] +
							plane[1] * sphereCenter[1] +
							plane[2] * sphereCenter[2] -
							plane[3];

						if (distanceToPlan < sphereRadius && distanceToPlan > -0.5) {
							const p = [
								sphereCenter[0] - plane[0] * distanceToPlan,
								sphereCenter[1] - plane[1] * distanceToPlan,
								sphereCenter[2] - plane[2] * distanceToPlan,
							];

							if (
								x <= p[0] &&
								p[0] <= x + 1 &&
								y <= p[1] &&
								p[1] <= y + 1 &&
								z <= p[2] &&
								p[2] <= z + 1
							) {
								collisions.push({
									distance: distanceToPlan,
									contactPoint: p,
									normal: [plane[0], plane[1], plane[2]],
								});
							} else {
								if (p[0] < x) p[0] = x;
								if (p[0] > x + 1) p[0] = x + 1;
								if (p[1] < y) p[1] = y;
								if (p[1] > y + 1) p[1] = y + 1;
								if (p[2] < z) p[2] = z;
								if (p[2] > z + 1) p[2] = z + 1;

								const distanceToCube = vec3.distance(sphereCenter, p);

								if (distanceToCube < sphereRadius) {
									collisions.push({
										distance: distanceToCube,
										contactPoint: p,
										normal: [plane[0], plane[1], plane[2]],
									});
								}
							}
						}
					}
				}
			}
		}
	}

	return collisions;
};
