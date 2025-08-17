import { mat4, vec3 } from "gl-matrix";
import { World } from "../world/type";

const up: vec3 = [0, 0, 1];
export const updateCamera = (world: World) => {
	if (world.viewMatrix.generation !== world.camera.generation) {
		mat4.lookAt(world.viewMatrix, world.camera.eye, world.camera.target, up);
		world.viewMatrix.generation = world.camera.generation;
	}

	if (world.projectionMatrix.generation !== world.viewportSize.generation) {
		const aspect = world.viewportSize[0] / world.viewportSize[1];
		mat4.perspective(
			world.projectionMatrix,
			world.camera.fovY,
			aspect,
			world.camera.near,
			world.camera.far,
		);

		world.projectionMatrix.generation = world.viewportSize.generation;
	}
};
