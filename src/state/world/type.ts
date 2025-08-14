import { vec3 } from "gl-matrix";

export type World = {
	camera: {
		eye: vec3;
		target: vec3;
		generation: number;
	};
};
