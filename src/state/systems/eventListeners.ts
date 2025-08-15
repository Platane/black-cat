import { vec2 } from "gl-matrix";
import { Key, World } from "../world/type";

export const createEventListeners = (
	world: World,
	containerElement: HTMLElement = document.body,
) => {
	world.inputs.type =
		"ontouchstart" in document.documentElement ? "mobile" : "keyboard_mouse";

	containerElement.onkeydown = (event) => {
		const key = keyMap[event.key];
		world.inputs.keydown.add(key);
	};

	containerElement.onkeyup = (event) => {
		const key = keyMap[event.key];
		world.inputs.keydown.delete(key);
	};

	window.onblur = () => {
		world.inputs.keydown.clear();
	};

	window.onmousedown = (e) => {
		if (world.inputs.type !== "keyboard_mouse") return;

		const key = ((e.button === 0 && "primary") ||
			(e.button === 2 && "secondary")) as Key;

		world.inputs.keydown.add(key);
	};

	window.onmouseup = (e) => {
		if (world.inputs.type !== "keyboard_mouse") return;

		const key = ((e.button === 0 && "primary") ||
			(e.button === 2 && "secondary")) as Key;

		world.inputs.keydown.delete(key);
	};

	window.oncontextmenu = (e) => {
		e.preventDefault();
	};
};

const keyMap = {
	ArrowUp: "arrow_up",
	ArrowDown: "arrow_down",
	ArrowLeft: "arrow_left",
	ArrowRight: "arrow_right",

	w: "arrow_up",
	s: "arrow_down",
	a: "arrow_left",
	d: "arrow_right",
} as Record<string, Key>;
