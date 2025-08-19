import { mat4, quat, vec3 } from "gl-matrix";
import { voxel, World } from "../world/type";

export const updateCarLocomotion = (world: World) => {
	const left = world.userInputs.keydown.has("arrow_left");
	const right = world.userInputs.keydown.has("arrow_right");

	let steeringAngle = 0;
	if (left !== right) {
		if (left) steeringAngle = Math.PI / 4;
		else steeringAngle = -Math.PI / 4;
	}
	world.car.direction[0] = Math.cos(steeringAngle);
	world.car.direction[1] = Math.sin(steeringAngle);

	let speed = 0; // in unit per tic
	const up = world.userInputs.keydown.has("arrow_up");
	const down = world.userInputs.keydown.has("arrow_down");
	if (down !== up) {
		if (up) speed = 0.08;
		else speed = -0.06;
	}

	//

	updateCar(world.car, { speed, steeringAngle: steeringAngle });

	world.car.position[2] =
		0.8 * getHeightAt(world, world.car.position[0], world.car.position[1]);
};

export type Transform = {
	position: vec3;
	rotation: quat;
};
export type CarInstruction = {
	speed: number;
	steeringAngle: number;
};
const v = vec3.create();
const updateCar = (tr: Transform, { speed, steeringAngle }: CarInstruction) => {
	quat.rotateZ(tr.rotation, tr.rotation, (steeringAngle / 2) * speed);

	vec3.set(v, 1, 0, 0);
	vec3.transformQuat(v, v, tr.rotation);

	tr.position[0] += v[0] * speed;
	tr.position[1] += v[1] * speed;
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

export const getChunkGridIndexAt = (world: World, x: number, y: number) => {
	const cx = Math.floor(x % world.ground.chunkSize);
	const cy = Math.floor(y % world.ground.chunkSize);

	return (cx + cy * world.ground.chunkSize) * world.ground.chunkHeight;
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
