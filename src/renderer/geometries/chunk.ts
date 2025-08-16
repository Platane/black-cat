import { vec3 } from "gl-matrix";
// @ts-ignore
import hash from "hash-int";
import { Chunk, ChunkInfo } from "../../state/world/type";

// vertex array interlaced
// position.x,
// position.y,
// position.z,
// normal.x,
// normal.y,
// normal.z,
// color.r,
// color.g,
// color.b,
export const generateChunkHull = (
	out: Float32Array,
	outOffset: number,
	grid: Chunk["grid"],
	{ chunkHeight, chunkSize }: ChunkInfo,
	translation: vec3,
	scale: vec3,
): number => {
	let i = 0; // vertex count
	const pushFace = (
		//
		ax: number,
		ay: number,
		az: number,

		//
		bx: number,
		by: number,
		bz: number,

		//
		cx: number,
		cy: number,
		cz: number,

		//
		dx: number,
		dy: number,
		dz: number,

		//
		nx: number,
		ny: number,
		nz: number,

		//
		cr: number,
		cg: number,
		cb: number,
	) => {
		for (let k = 6; k--; ) {
			out[outOffset + (i + k) * 9 + 3] = nx;
			out[outOffset + (i + k) * 9 + 4] = ny;
			out[outOffset + (i + k) * 9 + 5] = nz;

			out[outOffset + (i + k) * 9 + 6] = cr;
			out[outOffset + (i + k) * 9 + 7] = cg;
			out[outOffset + (i + k) * 9 + 8] = cb;
		}

		out[outOffset + i * 9 + 0] = ax;
		out[outOffset + i * 9 + 1] = ay;
		out[outOffset + i * 9 + 2] = az;
		i++;

		out[outOffset + i * 9 + 0] = bx;
		out[outOffset + i * 9 + 1] = by;
		out[outOffset + i * 9 + 2] = bz;
		i++;

		out[outOffset + i * 9 + 0] = cx;
		out[outOffset + i * 9 + 1] = cy;
		out[outOffset + i * 9 + 2] = cz;
		i++;

		//

		out[outOffset + i * 9 + 0] = ax;
		out[outOffset + i * 9 + 1] = ay;
		out[outOffset + i * 9 + 2] = az;
		i++;

		out[outOffset + i * 9 + 0] = cx;
		out[outOffset + i * 9 + 1] = cy;
		out[outOffset + i * 9 + 2] = cz;
		i++;

		out[outOffset + i * 9 + 0] = dx;
		out[outOffset + i * 9 + 1] = dy;
		out[outOffset + i * 9 + 2] = dz;
		i++;
	};

	for (let x = chunkSize; x--; )
		for (let y = chunkSize; y--; ) {
			for (let h = chunkHeight; h--; ) {
				const voxel = grid[(x + y * chunkSize) * chunkHeight + h];
				if (voxel) {
					const voxelHash = hash((x + y * chunkSize) * chunkHeight + h + 8423);
					pushFace(
						//
						translation[0] + (x + 0) * scale[0],
						translation[1] + (y + 0) * scale[1],
						translation[2] + h * scale[2],

						translation[0] + (x + 1) * scale[0],
						translation[1] + (y + 0) * scale[1],
						translation[2] + h * scale[2],

						translation[0] + (x + 1) * scale[0],
						translation[1] + (y + 1) * scale[1],
						translation[2] + h * scale[2],

						translation[0] + (x + 0) * scale[0],
						translation[1] + (y + 1) * scale[1],
						translation[2] + h * scale[2],

						0,
						0,
						1,

						0.7,
						0.8,
						0.3 + ((voxelHash % 12) / 12) * 0.5,
					);

					break;
				}
			}
		}

	return i;
};
