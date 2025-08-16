import { vec3 } from "gl-matrix";

export type World = {
	time: number;
	camera: {
		eye: vec3;
		target: vec3;
		generation: number;
	};
	inputs: {
		type: "keyboard_mouse" | "gamepad" | "mobile";
		keydown: Set<Key>;
	};

	ground: Ground;
};

export type ChunkInfo = {
	chunkSize: number;
	chunkHeight: number;
};

export type Ground = {
	sizeInChunk: number;

	// indexed by [ x + y * sizeInChunk ]
	chunks: Chunk[];

	generation: number; // sum of all chunk generation
} & ChunkInfo;

export type Chunk = {
	// indexed by [ ( x + y * chunkSize ) * chunkHeight + z ] = voxel.<>
	grid: Uint8Array;

	generation: number;
};

export const voxel = {
	empty: 0,
	sand_cube: 1,
	sand_slope_x_positive: 2,
	sand_slope_x_negative: 3,
	sand_slope_y_positive: 4,
	sand_slope_y_negative: 5,
};

export type Key =
	| "arrow_up"
	| "arrow_left"
	| "arrow_right"
	| "arrow_down"
	| "primary"
	| "secondary";
