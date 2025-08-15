import { createRenderer } from "./renderer";
import { createEventListeners } from "./state/systems/eventListeners";
import { World } from "./state/world/type";
import "./style.css";
import { create as createUiInfo } from "./ui/info";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = createRenderer(canvas);

const world: World = {
	time: 1,
	camera: { eye: [2, 17, 15], target: [0, 0, 0], generation: 1 },
	inputs: {
		type: "keyboard_mouse",
		keydown: new Set(),
	},
};

createEventListeners(world);

const uiInfo = createUiInfo();

const loop = () => {
	//
	// step
	//
	world.time++;

	// world.camera.eye[0] = Math.cos(Date.now() * 0.002) * 10;
	// world.camera.eye[1] = Math.sin(Date.now() * 0.002) * 10;
	// world.camera.generation++;

	//
	//
	//
	uiInfo.update(world);

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
