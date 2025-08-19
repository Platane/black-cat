import {
	getChunkGridIndexAt,
	getHeightAt,
} from "../state/systems/updateCarLocomotion";
import { World } from "../state/world/type";

export const create = () => {
	const el = document.getElementById("info")!;

	const update = (world: World) => {
		el.innerText = [
			[...world.car.direction].join(","),
			[...world.car.position].join(","),
			"height: " +
				getHeightAt(world, world.car.position[0], world.car.position[1]),
			...world.userInputs.keydown.keys(),
		].join("\n");
	};

	return { update };
};
