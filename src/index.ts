import { createRenderer } from "./renderer";
import { createEventListeners } from "./state/systems/eventListeners";
import { updateCamera } from "./state/systems/updateCamera";
import {
	createGroundBuffer,
	updateChunksBuffer,
} from "./state/systems/updateChunksBuffer";
import { ChunkInfo, voxel, World } from "./state/world/type";
import "./style.css";
import { create as createUiInfo } from "./ui/info";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = createRenderer(canvas);

const groundInfo: ChunkInfo = {
	chunkSize: 9,
	chunkHeight: 1,
	sizeInChunk: 1,
};

const world: World = {
	time: 1,
	viewportSize: Object.assign([0, 0], { generation: 0 }),
	camera: {
		fovY: Math.PI / 5,
		near: 0.1,
		far: 1000,
		eye: [2, 17, 15],
		target: [0, 0, 0],
		generation: 1,
	},
	inputs: {
		type: "keyboard_mouse",
		keydown: new Set(),
	},
	ground: {
		...groundInfo,
		chunks: [
			{
				grid: new Uint8Array(
					groundInfo.chunkSize *
						groundInfo.chunkSize *
						groundInfo.chunkHeight *
						9,
				).fill(voxel.sand_cube),
				generation: 1,
			},
		],
		generation: 1,
	},
	groundBuffer: createGroundBuffer(groundInfo),
	viewMatrix: Object.assign(new Float32Array(16), { generation: 0 }),
	projectionMatrix: Object.assign(new Float32Array(16), { generation: 0 }),
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

	updateCamera(world);
	updateChunksBuffer(world);

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
