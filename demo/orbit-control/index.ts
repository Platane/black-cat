import { mat4 } from "gl-matrix";
import { cube } from "../../src/renderer/geometries/cube";
import { createMaterialColored } from "../../src/renderer/materials/meshColored";
import { createOrbitControl } from "../../src/state/systems/orbitCamera";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const gl = canvas.getContext("webgl2")!;

const materialMeshColored = createMaterialColored(gl);
const bufferSet = materialMeshColored.createBufferSet();

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
	materialMeshColored.render(
		projectionMatrix,
		viewMatrix,
		objectMatrix,
		bufferSet,
	);

	requestAnimationFrame(loop);
};
loop();
