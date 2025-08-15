import { World } from "../state/world/type";

export const create = () => {
	const el = document.getElementById("info")!;

	const update = (world: World) => {
		el.innerText = [...world.inputs.keydown.keys()].join("\n");
	};

	return { update };
};
