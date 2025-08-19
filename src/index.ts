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
import { createRandom } from "./utils/random";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = createRenderer(canvas);

const groundInfo: ChunkInfo = {
	chunkSize: 8,
	chunkHeight: 16,
	sizeInChunk: 2,
};
const random = createRandom();
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
		position: [4, 4, 0],
		direction: [1, 0],
		rotation: [0, 0, 0, 1],
	},
	ground: {
		...groundInfo,
		chunks: Array.from(
			{ length: groundInfo.sizeInChunk * groundInfo.sizeInChunk },
			() => {
				const grid = new Uint8Array(
					groundInfo.chunkSize *
						groundInfo.chunkSize *
						groundInfo.chunkHeight *
						9,
				);
				for (let x = 0; x < groundInfo.chunkSize; x++) {
					for (let z = 0; z < groundInfo.chunkSize; z++) {
						grid[(x + z * groundInfo.chunkSize) * groundInfo.chunkHeight + 0] =
							voxel.sand_cube;

						if (random() < 0.07)
							grid[
								(x + z * groundInfo.chunkSize) * groundInfo.chunkHeight + 1
							] = voxel.sand_slope_x_positive;

						if (random() < 0.03)
							grid[
								(x + z * groundInfo.chunkSize) * groundInfo.chunkHeight + 1
							] = voxel.rock_cube;
					}
				}
				return { grid, generation: 1 };
			},
		),
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
