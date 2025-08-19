import { World } from "../world/type";

export const updateFollowCamera = (world: World) => {
	world.camera.target[0] = world.car.position[0];
	world.camera.target[1] = world.car.position[1];
	world.camera.target[2] = 0;

	world.camera.eye[0] = world.car.position[0] + 1;
	world.camera.eye[1] = world.car.position[1] + 20;
	world.camera.eye[2] = world.car.position[2] + 20;

	world.camera.generation++;
};
