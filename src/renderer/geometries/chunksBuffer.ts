import { vec3 } from "gl-matrix";
import { World } from "../../state/world/type";
import { generateChunkHull } from "./chunk";

export const createChunksBuffer = () => {
	const buffer = new Float32Array(100_000_000);

	const v = vec3.create();
	const s = [1, 1, 0.6];
	const update = (g: World["ground"]) => {
		// yolo, regenerate everything
		// a smarter approach would be to keep for each chunk the generation and length of the hull,
		// detect the ones that changed, then regenerate them at the end of the buffer, and copywithin to remove empty spaces

		out.nVertices = 0;
		for (let i = g.chunks.length; i--; ) {
			const x = i % g.sizeInChunk;
			const y = Math.floor(i / g.sizeInChunk);

			v[0] = x * g.chunkSize;
			v[1] = y * g.chunkSize;
			const l = generateChunkHull(
				buffer,
				out.nVertices,
				g.chunks[i].grid,
				g,
				v,
				s,
				i,
			);
			out.nVertices += l * 9;
		}

		out.generation = g.generation;
	};

	const out = { buffer, update, nVertices: 0, generation: 0 };

	return out;
};
