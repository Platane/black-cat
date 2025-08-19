import { vec2 } from "gl-matrix";
import { Key, World } from "../world/type";

export const createEventListeners = (
	world: World,
	containerElement: HTMLElement = document.body,
) => {
	world.userInputs.type =
		"ontouchstart" in document.documentElement ? "mobile" : "keyboard_mouse";

	containerElement.onkeydown = (event) => {
		const key = keyMap(event.key) as Key;
		world.userInputs.keydown.add(key);
	};

	containerElement.onkeyup = (event) => {
		const key = keyMap(event.key) as Key;
		world.userInputs.keydown.delete(key);
	};

	window.onblur = () => {
		world.userInputs.keydown.clear();
	};

	window.onmousedown = (e) => {
		if (world.userInputs.type !== "keyboard_mouse") return;

		const key = ((e.button === 0 && "primary") ||
			(e.button === 2 && "secondary")) as Key;

		world.userInputs.keydown.add(key);
	};

	window.onmouseup = (e) => {
		if (world.userInputs.type !== "keyboard_mouse") return;

		const key = ((e.button === 0 && "primary") ||
			(e.button === 2 && "secondary")) as Key;

		world.userInputs.keydown.delete(key);
	};

	window.oncontextmenu = (e) => {
		e.preventDefault();
	};

	window.onresize = () => {
		const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

		world.viewportSize[0] = containerElement.clientWidth * dpr;
		world.viewportSize[1] = containerElement.clientHeight * dpr;

		world.viewportSize.generation++;
	};
	(window.onresize as any)();
};

const keyMap = (key: string) =>
	(key == "ArrowUp" && "arrow_up") ||
	(key == "ArrowDown" && "arrow_down") ||
	(key == "ArrowLeft" && "arrow_left") ||
	(key == "ArrowRight" && "arrow_right") ||
	(key == "w" && "arrow_up") ||
	(key == "s" && "arrow_down") ||
	(key == "a" && "arrow_left") ||
	(key == "d" && "arrow_right") ||
	undefined;
