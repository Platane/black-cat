import { mat4 } from "gl-matrix";
import { World } from "../state/world/type";
import { cube } from "./geometries/cube";
import { createMaterialColored } from "./materials/meshColored";

export const createRenderer = (canvas: HTMLCanvasElement) => {
	const gl = canvas.getContext("webgl2")!;

	const materialMeshColored = createMaterialColored(gl);
	const bufferSet = materialMeshColored.createBufferSet();

	const viewMatrix = Object.assign(new Float32Array(16), { generation: 0 });
	const projectionMatrix = new Float32Array(16);

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

	const render = (world: World) => {
		//
		// update buffer
		//
		if (viewMatrix.generation !== world.camera.generation) {
			mat4.lookAt(viewMatrix, world.camera.eye, world.camera.target, [0, 1, 0]);
			viewMatrix.generation = world.camera.generation;
		}

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
	};

	const ready = loadGeometry().then(() => {
		//
		materialMeshColored.updateBufferSet(bufferSet, cube);
	});

	return { ready, render };
};

const loadGeometry = async () => {};
