import { mat4 } from "gl-matrix";
import { generateChunkHull } from "../../src/renderer/geometries/chunk";
import { cube } from "../../src/renderer/geometries/cube";
import { createMaterialColored } from "../../src/renderer/materials/meshColored";
import { createMaterialGround } from "../../src/renderer/materials/meshGround";
import { createOrbitControl } from "../../src/state/systems/orbitCamera";
import { Chunk, ChunkInfo, voxel } from "../../src/state/world/type";
import { createRandom } from "../../src/utils/random";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const gl = canvas.getContext("webgl2")!;

const materialMeshColored = createMaterialColored(gl);
const bufferSet = materialMeshColored.createBufferSet();

const materialMeshGround = createMaterialGround(gl);
const bufferSetGround = materialMeshGround.createBufferSet();

materialMeshColored.updateBufferSet(bufferSet, cube);

const viewMatrix = Object.assign(new Float32Array(16));
const projectionMatrix = new Float32Array(16);

const camera = { eye: [1, 10, 12], target: [0, 0, 0] };
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

const loop = () => {
	//
	// render
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const objectMatrix = new Float32Array(16);
	mat4.identity(objectMatrix);
	mat4.scale(objectMatrix, objectMatrix, [0.1, 0.1, 0.1]);
	materialMeshColored.render(
		projectionMatrix,
		viewMatrix,
		objectMatrix,
		bufferSet,
	);

	materialMeshGround.render(projectionMatrix, viewMatrix, bufferSetGround);

	requestAnimationFrame(loop);
};
loop();

const input = document.getElementById("range") as HTMLInputElement;
input.addEventListener("input", () => {
	const u = new URL(window.location.href);
	u.searchParams.set("chunk", input.value);
	history.replaceState(null, "", u);

	const c = chunks[parseInt(input.value)];
	const b = new Float32Array(1000_000);

	const nVertices = generateChunkHull(b, 0, c.grid, c, [0, 0, 0], [1, 1, 0.5]);

	materialMeshGround.updateBufferSet(bufferSetGround, b, nVertices);
});

const chunks = [
	{
		grid: new Uint8Array([voxel.empty]),
		generation: 0,
		chunkSize: 1,
		chunkHeight: 1,
	},
	{
		grid: new Uint8Array([voxel.sand_cube]),
		generation: 0,
		chunkSize: 1,
		chunkHeight: 1,
	},
	(() => {
		const chunkSize = 5;
		const chunkHeight = 3;
		const random = createRandom();
		const grid = new Uint8Array(
			Array.from({ length: chunkSize * chunkSize }).flatMap(() => {
				const a = Array.from({ length: chunkHeight }, () => voxel.empty);

				for (let h = Math.ceil(random() * chunkHeight); h--; ) {
					a[h] = voxel.sand_cube;
				}

				return a;
			}),
		);
		return { chunkHeight, chunkSize, grid, generation: 0 };
	})(),
] satisfies (Chunk & ChunkInfo)[];

input.max = chunks.length - 1 + "";
input.value =
	new URLSearchParams(window.location.search).get("chunk") ||
	chunks.length - 1 + "";
input.dispatchEvent(new Event("input"));
