import { vec3 } from "gl-matrix";
import { Chunk, voxel } from "../../state/world/type";
import { hashInt } from "../../utils/random";

const color: [number, number, number] = [0, 0, 0];

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
	{ chunkHeight, chunkSize }: { chunkSize: number; chunkHeight: number },
	translation: vec3,
	scale: vec3,
	seed: number = 123133,
): number => {
	let i = 0; // vertex count

	/**
	 * push the face defined by vertices a,b,c,d
	 * normal n and color c
	 */
	const pushQuadFace = (
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

		out[outOffset + i * 9 + 0] = translation[0] + ax * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + ay * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + az * scale[2];
		i++;

		out[outOffset + i * 9 + 0] = translation[0] + bx * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + by * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + bz * scale[2];
		i++;

		out[outOffset + i * 9 + 0] = translation[0] + cx * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + cy * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + cz * scale[2];
		i++;

		//

		out[outOffset + i * 9 + 0] = translation[0] + ax * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + ay * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + az * scale[2];
		i++;

		out[outOffset + i * 9 + 0] = translation[0] + cx * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + cy * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + cz * scale[2];
		i++;

		out[outOffset + i * 9 + 0] = translation[0] + dx * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + dy * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + dz * scale[2];
		i++;
	};

	const pushTriFace = (
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
		nx: number,
		ny: number,
		nz: number,

		//
		cr: number,
		cg: number,
		cb: number,
	) => {
		for (let k = 3; k--; ) {
			out[outOffset + (i + k) * 9 + 3] = nx;
			out[outOffset + (i + k) * 9 + 4] = ny;
			out[outOffset + (i + k) * 9 + 5] = nz;

			out[outOffset + (i + k) * 9 + 6] = cr;
			out[outOffset + (i + k) * 9 + 7] = cg;
			out[outOffset + (i + k) * 9 + 8] = cb;
		}

		out[outOffset + i * 9 + 0] = translation[0] + ax * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + ay * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + az * scale[2];
		i++;

		out[outOffset + i * 9 + 0] = translation[0] + bx * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + by * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + bz * scale[2];
		i++;

		out[outOffset + i * 9 + 0] = translation[0] + cx * scale[0];
		out[outOffset + i * 9 + 1] = translation[1] + cy * scale[1];
		out[outOffset + i * 9 + 2] = translation[2] + cz * scale[2];
		i++;
	};

	const isInside = (x: number, y: number, z: number) =>
		x >= 0 &&
		x < chunkSize &&
		y >= 0 &&
		y < chunkSize &&
		z >= 0 &&
		z < chunkHeight;

	const getVoxel = (x: number, y: number, z: number) =>
		isInside(x, y, z)
			? grid[(x + y * chunkSize) * chunkHeight + z]
			: voxel.empty;

	const processCube = (x: number, y: number, z: number) => {
		//  up
		if (getVoxel(x, y, z + 1) === voxel.empty)
			pushQuadFace(
				//
				x - 0.5,
				y - 0.5,
				z + 0.5,

				x + 0.5,
				y - 0.5,
				z + 0.5,

				x + 0.5,
				y + 0.5,
				z + 0.5,

				x - 0.5,
				y + 0.5,
				z + 0.5,

				0,
				0,
				1,

				...color,
			);

		for (const [sx, sy] of directions) {
			const v = getVoxel(x + sx, y + sy, z);
			if (
				v === voxel.empty ||
				v === voxel.sand_slope_x_negative ||
				v === voxel.sand_slope_y_negative ||
				v === voxel.sand_slope_x_positive ||
				v === voxel.sand_slope_y_positive
			) {
				pushQuadFace(
					//

					x + sx * 0.5 + sy * -0.5,
					y + sy * 0.5 - sx * -0.5,
					z + 0.5,

					x + sx * 0.5 + sy * 0.5,
					y + sy * 0.5 - sx * 0.5,
					z + 0.5,

					x + sx * 0.5 + sy * 0.5,
					y + sy * 0.5 - sx * 0.5,
					z - 0.5,

					x + sx * 0.5 + sy * -0.5,
					y + sy * 0.5 - sx * -0.5,
					z - 0.5,

					sx,
					sy,
					0,

					...color,
				);
			}
		}
	};

	const processSlope = (
		x: number,
		y: number,
		z: number,
		sx: number,
		sy: number,
	) => {
		// up
		if (getVoxel(x, y, z + 1) === voxel.empty)
			pushQuadFace(
				x + sx * 0.5 + sy * -0.5,
				y + sy * 0.5 - sx * -0.5,
				z + 0.5,

				x + sx * -0.5 + sy * -0.5,
				y + sy * -0.5 - sx * -0.5,
				z - 0.5,

				x + sx * -0.5 + sy * 0.5,
				y + sy * -0.5 - sx * 0.5,
				z - 0.5,

				x + sx * 0.5 + sy * 0.5,
				y + sy * 0.5 - sx * 0.5,
				z + 0.5,

				-sx * Math.SQRT1_2,
				-sy * Math.SQRT1_2,
				Math.SQRT1_2,

				...color,
			);

		// opposite
		if (getVoxel(x + sx, y + sy, z) === voxel.empty)
			pushQuadFace(
				x + sx * 0.5 + sy * -0.5,
				y + sy * 0.5 - sx * -0.5,
				z - 0.5,

				x + sx * 0.5 + sy * -0.5,
				y + sy * 0.5 - sx * -0.5,
				z + 0.5,

				x + sx * 0.5 + sy * 0.5,
				y + sy * 0.5 - sx * 0.5,
				z + 0.5,

				x + sx * 0.5 + sy * 0.5,
				y + sy * 0.5 - sx * 0.5,
				z - 0.5,

				sx,
				sy,
				0,

				...color,
			);

		// sides
		if (getVoxel(x + sy, y - sx, z) === voxel.empty)
			pushTriFace(
				x + sx * 0.5 + sy * 0.5,
				y + sy * 0.5 - sx * 0.5,
				z + 0.5,

				x + sx * -0.5 + sy * 0.5,
				y + sy * -0.5 - sx * 0.5,
				z - 0.5,

				x + sx * 0.5 + sy * 0.5,
				y + sy * 0.5 - sx * 0.5,
				z - 0.5,

				sy,
				-sx,
				0,

				...color,
			);
		if (getVoxel(x - sy, y + sx, z) === voxel.empty)
			pushTriFace(
				x + sx * -0.5 + sy * -0.5,
				y + sy * -0.5 - sx * -0.5,
				z - 0.5,

				x + sx * 0.5 + sy * -0.5,
				y + sy * 0.5 - sx * -0.5,
				z + 0.5,

				x + sx * 0.5 + sy * -0.5,
				y + sy * 0.5 - sx * -0.5,
				z - 0.5,

				-sy,
				sx,
				0,

				...color,
			);
	};

	for (let x = chunkSize; x--; )
		for (let y = chunkSize; y--; )
			for (let z = chunkHeight; z--; ) {
				const v = grid[(x + y * chunkSize) * chunkHeight + z];
				if (v === voxel.empty) continue;

				const voxelHash = hashInt((x + y * chunkSize) * chunkHeight + z + seed);

				getColor(color, v, voxelHash);

				if (v === voxel.sand_cube || v === voxel.rock_cube)
					processCube(x, y, z);
				else if (v === voxel.sand_slope_x_positive) processSlope(x, y, z, 1, 0);
				else if (v === voxel.sand_slope_x_negative)
					processSlope(x, y, z, -1, 0);
				else if (v === voxel.sand_slope_y_positive) processSlope(x, y, z, 0, 1);
				else if (v === voxel.sand_slope_y_negative)
					processSlope(x, y, z, 0, -1);
			}

	return i;
};

const sandColor = [0.9, 0.7, 0.3];
const rockColor = [0.47, 0.42, 0.3];
const getColor = (out: vec3, v: number, seed: number) => {
	const base = (((v === voxel.sand_cube ||
		v === voxel.sand_slope_x_negative ||
		v === voxel.sand_slope_x_positive ||
		v === voxel.sand_slope_y_negative ||
		v === voxel.sand_slope_y_positive) &&
		sandColor) ||
		(v === voxel.rock_cube && rockColor)) as vec3;

	out[0] = base[0] + ((seed % 5) / 5 - 0.5) * 0.1;
	out[1] = base[1] + (((seed * 7) % 5) / 5 - 0.5) * 0.1;
	out[2] = base[2] + (((seed * 3) % 5) / 5 - 0.5) * 0.1;
};

const directions = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
] as const;
