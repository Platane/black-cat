import { getHeightAt } from "../state/systems/utils-ground";
import { World } from "../state/world/type";

export const create = () => {
	const el = document.getElementById("info")!;

	const update = (world: World) => {
		el.innerText = [
			world.car.steering.toFixed(2).padStart(5, " "),
			world.car.speed.toFixed(2),
			[...world.car.position].join(","),
			"height: " +
				getHeightAt(world, world.car.position[0], world.car.position[1]),
			...world.userInputs.keydown.keys(),
		].join("\n");
	};

	return { update };
};
