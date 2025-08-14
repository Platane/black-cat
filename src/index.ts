import { createRenderer } from "./renderer";
import { World } from "./state/world/type";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = createRenderer(canvas);

const world: World = {
	camera: { eye: [1, 2, 5], target: [0, 0, 0], generation: 1 },
};

const loop = () => {
	//
	// step
	//
	world.camera.eye[0] = Math.cos(Date.now() * 0.004) * 10;
	world.camera.eye[2] = Math.sin(Date.now() * 0.004) * 10;
	world.camera.generation++;

	//
	// render
	//
	renderer.render(world);

	//
	//
	//
	requestAnimationFrame(loop);
};

renderer.ready.then(loop);
