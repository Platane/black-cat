import { createRenderer } from "./renderer";
import { createEventListeners } from "./state/systems/eventListeners";
import { updateCameraMatrix } from "./state/systems/updateCameraMatrix";
import { updateCarDebugCubes } from "./state/systems/updateCarDebugCubes";
import { updateCarLocomotion } from "./state/systems/updateCarLocomotion";
import {
	createGroundBuffer,
	updateChunksBuffer,
} from "./state/systems/updateChunksBuffer";
import { updateFollowCamera } from "./state/systems/updateFollowCamera";
import { ChunkInfo, voxel, World } from "./state/world/type";
import "./style.css";
import { create as createUiInfo } from "./ui/info";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = createRenderer(canvas);

const groundInfo: ChunkInfo = {
	chunkSize: 3,
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
		eye: [2, 17, 50],
		target: [0, 0, 0],
		generation: 1,
	},
	userInputs: {
		type: "keyboard_mouse",
		keydown: new Set(),
	},
	car: {
		position: [0, 0, 0],
		direction: [1, 0],
		rotation: [0, 0, 0, 1],
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

	debugCubes: [],
};

createEventListeners(world);

const uiInfo = createUiInfo();

const loop = () => {
	//
	// step
	//
	world.time++;

	updateCarLocomotion(world);
	updateFollowCamera(world);

	updateCameraMatrix(world);
	updateChunksBuffer(world);
	updateCarDebugCubes(world);

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
