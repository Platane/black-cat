import { quat, vec2, vec3 } from "gl-matrix";

export type World = {
	time: number;
	viewportSize: vec2 & WithGeneration;
	camera: {
		fovY: number;

		near: number;
		far: number;

		eye: vec3;
		target: vec3;
	} & WithGeneration;

	userInputs: {
		type: "keyboard_mouse" | "gamepad" | "mobile";
		keydown: Set<Key>;
	};

	car: {
		steering: number;
		steeringTarget: number;
		steeringV: number;
		throttle: number;
		speed: number;

		bones: {
			worldPosition: vec3;
			localTarget: vec3;
			localPosition: vec3;
			velocity: vec3;
		}[];

		wheels: {
			localPosition: vec3;
			worldPosition: vec3;
			velocity: vec3;
			acceleration: vec3;
		}[];

		velocity: vec3;
		position: vec3;
		rotation: quat;
	};

	ground: Ground;

	debugCubes: Float32Array[];
	debugCubesIndex: number;

	// derived from the ground
	groundBuffer: GroundBuffer;

	// derived from the camera
	viewMatrix: Float32Array & WithGeneration;

	// updated on resize
	projectionMatrix: Float32Array & WithGeneration;
};

export type GroundBuffer = {
	// as interlaced vertex buffer
	// position.x,
	// position.y,
	// position.z,
	// normal.x,
	// normal.y,
	// normal.z,
	// color.r,
	// color.g,
	// color.b,
	buffer: Float32Array;

	nVertices: number;

	// for each chunk, in the order of the buffer
	// j * 3 + 0 = index of chunk in ground.chunks
	// j * 3 + 1 = generation of chunk
	// j * 3 + 2 = length in vertices
	chunkIndices: Uint16Array;

	generation: number;
};

type WithGeneration = {
	generation: number;
};

export type ChunkInfo = {
	chunkSize: number;
	chunkHeight: number;

	sizeInChunk: number;
};

export type Ground = {
	// indexed by [ x + y * sizeInChunk ]
	chunks: Chunk[];

	voxelHeight: number;

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
	rock_cube: 6,
};

export type Key =
	| "arrow_up"
	| "arrow_left"
	| "arrow_right"
	| "arrow_down"
	| "primary"
	| "secondary";
