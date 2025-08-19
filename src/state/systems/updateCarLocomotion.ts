import { mat4, vec3 } from "gl-matrix";
import { World } from "../world/type";

export const updateCarLocomotion = (world: World) => {
	const left = world.userInputs.keydown.has("arrow_left");
	const right = world.userInputs.keydown.has("arrow_right");

	let angle = 0;
	if (left !== right) {
		if (left) angle = Math.PI / 4;
		else angle = -Math.PI / 4;
	}
	world.car.direction[0] = Math.cos(angle);
	world.car.direction[1] = Math.sin(angle);

	let speed = 0;
	const up = world.userInputs.keydown.has("arrow_up");
	const down = world.userInputs.keydown.has("arrow_down");
	if (down !== up) {
		if (up) speed = 0.05;
		else speed = -0.02;
	}

	world.car.position[0] += world.car.direction[0] * speed;
	world.car.position[1] += world.car.direction[1] * speed;
};
