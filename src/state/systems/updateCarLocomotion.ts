import { mat4, quat, vec3 } from "gl-matrix";
import { World } from "../world/type";

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
		if (up) speed = 0.05;
		else speed = -0.02;
	}

	//

	updateCar(world.car, { speed, steeringAngle: steeringAngle });
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
