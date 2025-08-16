import { vec3 } from "gl-matrix";
import { World } from "../../state/world/type";
import { generateChunkHull } from "./chunk";

export const createChunksBuffer = () => {
	const buffer = new Float32Array(10_000_000);

	const v = vec3.create();
	const s = [1, 1, 0.6];
	const updateBrute = (g: World["ground"]) => {
		out.nVertices = 0;
		for (let i = g.chunks.length; i--; ) {
			const x = i % g.sizeInChunk;
			const y = Math.floor(i / g.sizeInChunk);

			v[0] = x * g.chunkSize;
			v[1] = y * g.chunkSize;
			const l = generateChunkHull(
				buffer,
				out.nVertices * 9,
				g.chunks[i].grid,
				g,
				v,
				s,
				i,
			);
			out.nVertices += l;
		}

		out.generation = g.generation;
	};

	const segments = new Uint16Array(16 * 16 * 3);
	for (let i = 0; i < segments.length / 3; i++) segments[i * 3] = i;

	const updateOneChunk = (g: World["ground"], i: number) => {
		const chunk = g.chunks[i];

		let offset = 0;
		let j = 0;
		while (segments[j * 3 + 0] !== i) {
			offset += segments[j * 3 + 2];
			j++;
		}

		const previousLength = segments[j * 3 + 2];

		const end = out.nVertices;
		const x = i % g.sizeInChunk;
		const y = Math.floor(i / g.sizeInChunk);

		v[0] = x * g.chunkSize;
		v[1] = y * g.chunkSize;
		const newLength = generateChunkHull(
			buffer,
			end * 9,
			chunk.grid,
			g,
			v,
			s,
			i,
		);

		buffer.copyWithin(
			offset * 9,
			(offset + previousLength) * 9,
			(end + newLength) * 9,
		);
		out.nVertices += newLength - previousLength;

		segments.copyWithin(j * 3, (j + 1) * 3);
		segments[(g.chunks.length - 1) * 3 + 0] = i;
		segments[(g.chunks.length - 1) * 3 + 1] = chunk.generation;
		segments[(g.chunks.length - 1) * 3 + 2] = newLength;
	};

	const updateSmart = (g: World["ground"]) => {
		for (let i = g.chunks.length; i--; ) {
			const index = segments[i * 3 + 0];
			const generation = segments[i * 3 + 1];

			if (g.chunks[index].generation !== generation) updateOneChunk(g, index);
		}

		out.generation = g.generation;
	};

	const out = { buffer, update: updateSmart, nVertices: 0, generation: 0 };

	return out;
};
