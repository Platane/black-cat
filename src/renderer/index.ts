import { mat4 } from "gl-matrix";
import { World } from "../state/world/type";
import { cube } from "./geometries/cube";
import { createMaterialColored } from "./materials/meshColored";
import { createMaterialGround } from "./materials/meshGround";

export const createRenderer = (canvas: HTMLCanvasElement) => {
	const gl = canvas.getContext("webgl2")!;

	const materialMeshColored = createMaterialColored(gl);
	const bufferSet = materialMeshColored.createBufferSet();

	const materialMeshGround = createMaterialGround(gl);
	const groundBuffer = Object.assign(materialMeshGround.createBufferSet(), {
		generation: 0,
	});

	let viewportGeneration = 0;

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	const directionalLight = new Float32Array([0.615457, 0.492365, 0.615457, 1]);

	const render = (world: World) => {
		//
		// update buffer
		//
		if (viewportGeneration !== world.viewportSize.generation) {
			canvas.width = world.viewportSize[0];
			canvas.height = world.viewportSize[1];
			gl.viewport(0, 0, world.viewportSize[0], world.viewportSize[1]);
			viewportGeneration = world.viewportSize.generation;
		}
		if (groundBuffer.generation !== world.groundBuffer.generation) {
			materialMeshGround.updateBufferSet(
				groundBuffer,
				world.groundBuffer.buffer,
				world.groundBuffer.nVertices,
			);
			groundBuffer.generation = world.groundBuffer.generation;
		}

		//
		// render
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		for (let i = world.debugCubesIndex; i--; )
			materialMeshColored.render(
				world.projectionMatrix,
				world.viewMatrix,
				world.debugCubes[i],
				bufferSet,
			);

		materialMeshGround.render(
			world.projectionMatrix,
			world.viewMatrix,
			directionalLight,
			groundBuffer,
		);
	};

	const ready = loadGeometry().then(() => {
		//
		materialMeshColored.updateBufferSet(bufferSet, cube);
	});

	return { ready, render };
};

const loadGeometry = async () => {};
