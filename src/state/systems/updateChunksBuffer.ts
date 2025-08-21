import { vec3 } from "gl-matrix";
import { generateChunkHull } from "../../renderer/geometries/chunk";
import { ChunkInfo, GroundBuffer, World } from "../world/type";

const translation = vec3.create();
const scale = [1, 1, 0.8];
export const updateChunksBufferBrute = (world: World) => {
	if (world.groundBuffer.generation === world.ground.generation) return;

	scale[2] = world.ground.voxelHeight;

	world.groundBuffer.nVertices = 0;
	for (let i = world.ground.chunks.length; i--; ) {
		const x = i % world.ground.sizeInChunk;
		const y = Math.floor(i / world.ground.sizeInChunk);

		translation[0] = x * world.ground.chunkSize;
		translation[1] = y * world.ground.chunkSize;
		const l = generateChunkHull(
			world.groundBuffer.buffer,
			world.groundBuffer.nVertices * 9,
			world.ground.chunks[i].grid,
			world.ground,
			translation,
			scale,
			i,
		);
		world.groundBuffer.nVertices += l;
	}

	world.groundBuffer.generation = world.ground.generation;
};

export const createGroundBuffer = ({
	chunkSize,
	chunkHeight,
	sizeInChunk,
}: ChunkInfo): GroundBuffer => {
	const maxCube =
		chunkSize * chunkSize * sizeInChunk * sizeInChunk * chunkHeight;

	const maxVertices = maxCube * 7 * 6;

	const optimisticMaxVertices = Math.round(maxVertices * 0.4);

	const buffer = new Float32Array(optimisticMaxVertices * 9);

	const chunkIndices = new Uint16Array(sizeInChunk * sizeInChunk * 3);
	for (let i = 0; i < chunkIndices.length / 3; i++) chunkIndices[i * 3] = i;

	return { chunkIndices, buffer, nVertices: 0, generation: 0 };
};

export const updateChunksBuffer = (world: World) => {
	if (world.groundBuffer.generation == world.ground.generation) return;

	scale[2] = world.ground.voxelHeight;

	for (let i = world.ground.chunks.length; i--; ) {
		const index = world.groundBuffer.chunkIndices[i * 3 + 0];
		const generation = world.groundBuffer.chunkIndices[i * 3 + 1];

		if (world.ground.chunks[index].generation !== generation)
			updateOneChunk(world, index);
	}

	world.groundBuffer.generation = world.ground.generation;
};

const updateOneChunk = (world: World, i: number) => {
	const chunk = world.ground.chunks[i];

	let offset = 0;
	let j = 0;
	while (world.groundBuffer.chunkIndices[j * 3 + 0] !== i) {
		offset += world.groundBuffer.chunkIndices[j * 3 + 2];
		j++;
	}

	const previousLength = world.groundBuffer.chunkIndices[j * 3 + 2];

	const end = world.groundBuffer.nVertices;
	const x = i % world.ground.sizeInChunk;
	const y = Math.floor(i / world.ground.sizeInChunk);

	translation[0] = x * world.ground.chunkSize + 0.5;
	translation[1] = y * world.ground.chunkSize + 0.5;
	translation[2] = 0.5;
	const newLength = generateChunkHull(
		world.groundBuffer.buffer,
		end * 9,
		chunk.grid,
		world.ground,
		translation,
		scale,
		i,
	);

	world.groundBuffer.buffer.copyWithin(
		offset * 9,
		(offset + previousLength) * 9,
		(end + newLength) * 9,
	);
	world.groundBuffer.nVertices += newLength - previousLength;

	world.groundBuffer.chunkIndices.copyWithin(j * 3, (j + 1) * 3);
	world.groundBuffer.chunkIndices[(world.ground.chunks.length - 1) * 3 + 0] = i;
	world.groundBuffer.chunkIndices[(world.ground.chunks.length - 1) * 3 + 1] =
		chunk.generation;
	world.groundBuffer.chunkIndices[(world.ground.chunks.length - 1) * 3 + 2] =
		newLength;
};
