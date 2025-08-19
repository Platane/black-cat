import { mat4, quat, vec3 } from "gl-matrix";
import { World } from "../world/type";
import { getHeightAt } from "./utils-ground";

export const updateCarControl = (world: World) => {
	world.car.steeringTarget = 0;
	if (world.userInputs.keydown.has("arrow_left"))
		world.car.steeringTarget += Math.PI / 4;
	if (world.userInputs.keydown.has("arrow_right"))
		world.car.steeringTarget -= Math.PI / 4;

	world.car.throttle = 0;
	if (world.userInputs.keydown.has("arrow_up")) world.car.throttle += 1;
	if (world.userInputs.keydown.has("arrow_down")) world.car.throttle -= 1;
};

export const updateCarLocomotion = (world: World) => {
	{
		const tension = 0.1;
		const friction = 0.3;
		const a =
			-tension * (world.car.steering - world.car.steeringTarget) -
			friction * world.car.steeringV;

		world.car.steeringV += a;
		world.car.steering += world.car.steeringV;
	}

	{
		const friction = 0.92;
		const power = 0.01;

		world.car.speed = friction * world.car.speed + world.car.throttle * power;
	}

	quat.rotateZ(
		world.car.rotation,
		world.car.rotation,
		(world.car.steering / 2) * world.car.speed,
	);

	vec3.set(v, 1, 0, 0);
	vec3.transformQuat(v, v, world.car.rotation);

	world.car.position[0] += v[0] * world.car.speed;
	world.car.position[1] += v[1] * world.car.speed;

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
