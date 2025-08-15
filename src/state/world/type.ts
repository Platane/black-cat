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
};

export type Key =
	| "arrow_up"
	| "arrow_left"
	| "arrow_right"
	| "arrow_down"
	| "primary"
	| "secondary";
