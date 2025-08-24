import { vec3, vec4 } from "gl-matrix";
import { slopeDirections, voxel, World } from "../world/type";

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

export type Collision = {
	penetration: number;
	normal: vec3;
	contactPoint: vec3;
};
export const getSphereCollision = (
	world: World,
	sphereCenter: vec3,
	sphereRadius: number,
) => {
	const collisions: Collision[] = [];

	console.log("---");

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
				getSphereCollisionVoxel(
					collisions,
					x,
					y,
					z,
					world,
					sphereCenter,
					sphereRadius,
				);
			}
		}
	}

	return collisions;
};

const getSphereCollisionVoxel = (
	collisions: Collision[],
	x: number,
	y: number,
	z: number,
	world: World,
	sphereCenter: vec3,
	sphereRadius: number,
) => {
	const v = getVoxelAt(world, x, y, z);

	const clampToCube = (collision: Collision) => {
		const p = collision.contactPoint;

		let inside = true;
		if (p[0] < x) {
			inside = false;
			p[0] = x;
		}
		if (p[0] > x + 1) {
			inside = false;
			p[0] = x + 1;
		}
		if (p[1] < y) {
			inside = false;
			p[1] = y;
		}
		if (p[1] > y + 1) {
			inside = false;
			p[1] = y + 1;
		}
		if (p[2] < z) {
			inside = false;
			p[2] = z;
		}
		if (p[2] > z + 1) {
			inside = false;
			p[2] = z + 1;
		}

		if (inside) return;

		const distanceToCube = vec3.distance(sphereCenter, p);

		collision.penetration = sphereRadius - distanceToCube;
	};

	const planCollision = (plane: vec4) => {
		const distanceToPlane =
			plane[0] * sphereCenter[0] +
			plane[1] * sphereCenter[1] +
			plane[2] * sphereCenter[2] -
			plane[3];

		if (distanceToPlane < sphereRadius && distanceToPlane > -0.4) {
			const p = [
				sphereCenter[0] - plane[0] * distanceToPlane,
				sphereCenter[1] - plane[1] * distanceToPlane,
				sphereCenter[2] - plane[2] * distanceToPlane,
			];
			return {
				contactPoint: p,
				normal: plane,
				penetration: sphereRadius - distanceToPlane,
			} satisfies Collision;
		}
	};

	if (v === voxel.sand_cube) {
		for (const p of [
			[1, 0, 0, x + 1],
			[-1, 0, 0, -x],
			[0, 1, 0, y + 1],
			[0, -1, 0, -y],
			[0, 0, 1, z + 1],
			// [0, 0, -1, -z],
		]) {
			if (getVoxelAt(world, x + p[0], y + p[1], z + p[2]) !== voxel.empty)
				continue;
			let collision = planCollision(p);
			if (collision) clampToCube(collision);
			if (collision && collision.penetration > 0) collisions.push(collision);
		}
	}
	if (v === voxel.sand_slope_x_positive || v === voxel.sand_slope_x_negative) {
		const [sx, sy] = slopeDirections[v];
		{
			const slope = [-sx / Math.SQRT2, -sy / Math.SQRT2, 1 / Math.SQRT2, 0];
			slope[3] =
				slope[0] * (x + 0.5 - sx * 0.5) +
				slope[1] * (y + 0.5 - sy * 0.5) +
				slope[2] * z;

			let collision = planCollision(slope);
			if (collision) clampToCube(collision);
			if (collision && collision.penetration > 0) collisions.push(collision);
		}

		{
			const back = [sx, sy, 0, 0];
			back[3] = back[0] * (x + 0.5 + sx * 0.5) + back[1] * (y + 0.5 + sy * 0.5);

			let collision = planCollision(back);

			if (
				collision &&
				collision.contactPoint[2] % 1 > 0.5 &&
				sphereRadius - collision.penetration < 0.2
			) {
				collision = undefined;
			}

			if (collision) clampToCube(collision);
			if (collision && collision.penetration > 0) collisions.push(collision);
		}
	}
};
