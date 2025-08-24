import { mat3, mat4, quat, vec3 } from "gl-matrix";
import { World } from "../world/type";
import { getNormalAt, getSphereCollision } from "./utils-ground";

export const updateCarControl = (world: World) => {
	world.car.steeringTarget = 0;
	if (world.userInputs.keydown.has("arrow_left"))
		world.car.steeringTarget += Math.PI / 4;
	if (world.userInputs.keydown.has("arrow_right"))
		world.car.steeringTarget -= Math.PI / 4;

	world.car.throttle = 0;
	if (world.userInputs.keydown.has("arrow_up")) world.car.throttle += 1;
	if (world.userInputs.keydown.has("arrow_down")) world.car.throttle -= 1;
};

const wheelRadius = 0.2;
export const updateCarEngine = (world: World) => {
	{
		const tension = 0.1;
		const friction = 0.3;
		const a =
			-tension * (world.car.steering - world.car.steeringTarget) -
			friction * world.car.steeringV;

		world.car.steeringV += a;
		world.car.steering += world.car.steeringV;
	}

	{
		const friction = 0.92;
		const power = 0.01;

		world.car.speed = friction * world.car.speed + world.car.throttle * power;
	}
};

export const updateCarPhysic = (world: World) => {
	quat.rotateZ(
		world.car.rotation,
		world.car.rotation,
		(world.car.steering / 2) * world.car.speed,
	);

	vec3.set(v, 1, 0, 0);
	vec3.transformQuat(v, v, world.car.rotation);

	world.car.position[0] += v[0] * world.car.speed;
	world.car.position[1] += v[1] * world.car.speed;
	// world.car.position[2] = 1;

	const car = world.car;

	//
	// collision
	//
	const constraints: { normal: vec3; penetration: number }[] = [];

	for (const wheel of car.wheels) {
		vec3.zero(wheel.acceleration);

		vec3.transformQuat(wheel.worldPosition, wheel.localPosition, car.rotation);
		vec3.add(wheel.worldPosition, wheel.worldPosition, car.position);

		{
			const cube = world.debugCubes[world.debugCubesIndex++];
			vec3.copy(v, wheel.worldPosition);
			vec3.set(s, 0.1, 0.1, 0.1);
			quat.identity(q);
			mat4.fromRotationTranslationScale(cube, q, v, s);
		}

		const collisions = getSphereCollision(
			world,
			wheel.worldPosition,
			wheelRadius,
		);

		constraints.push(...collisions);

		for (const c of collisions) {
			const u = (c.penetration / wheelRadius) * 0.1;
			{
				const cube = world.debugCubes[world.debugCubesIndex++];
				vec3.copy(v, c.contactPoint);
				vec3.set(s, u, u, u);
				quat.identity(q);
				mat4.fromRotationTranslationScale(cube, q, v, s);
			}
			{
				const cube = world.debugCubes[world.debugCubesIndex++];
				vec3.scaleAndAdd(v, c.contactPoint, c.normal, 0.6 * u);
				vec3.set(s, 0.5 * u, 0.5 * u, 0.5 * u);
				quat.identity(q);
				mat4.fromRotationTranslationScale(cube, q, v, s);
			}
		}
	}

	const getError = (d: vec3) =>
		constraints.reduce((sum, c) => {
			const u = vec3.dot(c.normal, d);
			if (u < c.penetration) return sum + (c.penetration - u) ** 2;
			return sum;
		}, 0);

	{
		const d = vec3.create();
		for (let i = 50; i--; ) {
			const e = getError(d);
			const eps = 0.001;
			const dx = -(getError([d[0] + eps, d[1], d[2]]) - e) / eps;
			const dy = -(getError([d[0], d[1] + eps, d[2]]) - e) / eps;
			const dz = -(getError([d[0], d[1], d[2] + eps]) - e) / eps;

			d[0] += dx * 0.01;
			d[1] += dy * 0.01;
			d[2] += dz * 0.01;

			// const l = Math.hypot(dx, dy, dz);

			// if (l <= 0) continue;
			// d[0] += (dx / l) * 0.01 * (i / 30);
			// d[1] += (dy / l) * 0.01 * (i / 30);
			// d[2] += (dz / l) * 0.01 * (i / 30);
		}

		car.position[0] += d[0];
		car.position[1] += d[1];
		car.position[2] += d[2];
	}

	// derive car position from the wheels
	{
		const u = vec3.create();
		const v = vec3.create();
		const n = vec3.create();
		vec3.sub(u, car.wheels[0].worldPosition, car.wheels[1].worldPosition);
		vec3.normalize(u, u);
		vec3.set(
			v,
			(car.wheels[0].worldPosition[0] -
				car.wheels[2].worldPosition[0] +
				(car.wheels[1].worldPosition[0] - car.wheels[3].worldPosition[0])) /
				2,

			(car.wheels[0].worldPosition[1] -
				car.wheels[2].worldPosition[1] +
				(car.wheels[1].worldPosition[1] - car.wheels[3].worldPosition[1])) /
				2,
			(car.wheels[0].worldPosition[2] -
				car.wheels[2].worldPosition[2] +
				(car.wheels[1].worldPosition[2] - car.wheels[3].worldPosition[2])) /
				2,
		);
		vec3.normalize(v, v);
		vec3.cross(n, u, v);
		vec3.normalize(n, n);
	}
};

const s = vec3.create();
const q = quat.create();

export type Transform = {
	position: vec3;
	rotation: quat;
};
export type CarInstruction = {
	speed: number;
	steeringAngle: number;
};
const v = vec3.create();
