import { mat4 } from "gl-matrix";
import { generateChunkHull } from "../../src/renderer/geometries/chunk";
import { cube } from "../../src/renderer/geometries/cube";
import { createMaterialColored } from "../../src/renderer/materials/meshColored";
import { createMaterialGround } from "../../src/renderer/materials/meshGround";
import { createOrbitControl } from "../../src/state/systems/orbitCamera";
import {
	createGroundBuffer,
	updateChunksBuffer,
} from "../../src/state/systems/updateChunksBuffer";
import { Chunk, ChunkInfo, voxel, World } from "../../src/state/world/type";
import { createRandom } from "../../src/utils/random";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const gl = canvas.getContext("webgl2")!;

const materialMeshColored = createMaterialColored(gl);
const bufferSet = materialMeshColored.createBufferSet();
materialMeshColored.updateBufferSet(bufferSet, cube);

const materialMeshGround = createMaterialGround(gl);
const bufferSetGround = materialMeshGround.createBufferSet();

const viewMatrix = Object.assign(new Float32Array(16));
const projectionMatrix = new Float32Array(16);

const camera = { eye: [1, 10, 12], target: [10, 10, 0] };
mat4.lookAt(viewMatrix, camera.eye, camera.target, [0, 0, 1]);

window.onresize = () => {
	const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;

	const aspect = canvas.width / canvas.height;
	const near = 0.1;
	const far = 2000;
	const fovY = Math.PI / 4;

	mat4.perspective(projectionMatrix, fovY, aspect, near, far);

	gl.viewport(0, 0, canvas.width, canvas.height);
};
(window.onresize as any)();

gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

createOrbitControl({ canvas }, camera, () => {
	mat4.lookAt(viewMatrix, camera.eye, camera.target, [0, 0, 1]);
});

const ground: World["ground"] = {
	sizeInChunk: 12,
	chunkHeight: 10,
	chunkSize: 8,
	chunks: [],
	generation: 1,
};
const groundBuffer = createGroundBuffer(ground);
for (let k = ground.sizeInChunk ** 2; k--; ) {
	const grid = new Uint8Array(
		Array.from({ length: ground.chunkSize ** 2 }).flatMap(() => {
			const a = Array.from({ length: ground.chunkHeight }, () => voxel.empty);

			a[0] = voxel.sand_cube;
			if (Math.random() > 0.9) a[1] = voxel.sand_cube;

			return a;
		}),
	);
	ground.chunks.push({
		grid,
		generation: 1,
	});
}

const stack = () => {
	const chunk = ground.chunks[Math.floor(Math.random() * ground.chunks.length)];

	const x = Math.floor(Math.random() * ground.chunkSize);
	const y = Math.floor(Math.random() * ground.chunkSize);

	let h = 0;
	while (
		h + 1 < ground.chunkHeight &&
		chunk.grid[(x + y * ground.chunkSize) * ground.chunkHeight + h] !==
			voxel.empty
	)
		h++;

	chunk.grid[(x + y * ground.chunkSize) * ground.chunkHeight + h] =
		voxel.sand_cube;

	chunk.generation++;

	ground.generation++;
};

const loop = () => {
	//
	// render
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const objectMatrix = new Float32Array(16);
	mat4.identity(objectMatrix);
	mat4.scale(objectMatrix, objectMatrix, [0.5, 0.5, 0.5]);
	materialMeshColored.render(
		projectionMatrix,
		viewMatrix,
		objectMatrix,
		bufferSet,
	);

	stack();

	if (groundBuffer.generation !== ground.generation) {
		updateChunksBuffer({ groundBuffer, ground } as any);
		materialMeshGround.updateBufferSet(
			bufferSetGround,
			groundBuffer.buffer,
			groundBuffer.nVertices,
		);
		groundBuffer.generation = ground.generation;
	}

	materialMeshGround.render(projectionMatrix, viewMatrix, bufferSetGround);

	requestAnimationFrame(loop);
};
loop();
