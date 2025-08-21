import { getNormalAt, getSphereCollision } from "../state/systems/utils-ground";
import { World } from "../state/world/type";

export const create = () => {
	const el = document.getElementById("info")!;

	const update = (world: World) => {
		const out = { normal: [], y: 0 };
		getNormalAt(out, world, world.car.position[0], world.car.position[1]);

		el.innerText = [
			world.car.steering.toFixed(2).padStart(5, " "),
			world.car.speed.toFixed(2),
			[...world.car.position].join(","),
			"height: " + out.y,
			// ...getSphereCollision(
			// 	world,
			// 	[
			// 		world.car.position[0],
			// 		world.car.position[1],
			// 		world.car.position[2] + 0.01,
			// 	],
			// 	0.4,
			// ).map((c) => "contact point: " + c.contactPoint.join(", ")),
			...world.userInputs.keydown.keys(),
		].join("\n");
	};

	return { update };
};
