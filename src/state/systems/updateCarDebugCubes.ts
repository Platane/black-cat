import { mat4, quat, vec3 } from "gl-matrix";
import { World } from "../world/type";
import { getSphereCollision } from "./utils-ground";

const m = mat4.create();
const v = vec3.create();
const s = vec3.create();
const q = quat.create();
export const updateCarDebugCubes = (world: World) => {
	while (world.debugCubes.length < 200)
		world.debugCubes.push(new Float32Array(16));

	let i = 0;

	vec3.copy(v, world.car.position);
	v[2] += 2;
	vec3.set(s, 1, 1, 1);
	quat.copy(q, world.car.rotation);
	mat4.fromRotationTranslationScale(m, q, v, s);

	{
		const body = world.debugCubes[i++];
		vec3.set(v, 0, 0, 0.3);
		vec3.set(s, 1, 0.6, 0.3);
		quat.identity(q);
		mat4.fromRotationTranslationScale(body, q, v, s);
		mat4.multiply(body, m, body);
	}
	{
		const body = world.debugCubes[i++];
		vec3.set(v, -0.15, 0, 0.55);
		vec3.set(s, 0.5, 0.6, 0.2);
		quat.identity(q);
		mat4.fromRotationTranslationScale(body, q, v, s);
		mat4.multiply(body, m, body);
	}

	vec3.set(v, 0.4, 0.4, 0.35 / 2);
	vec3.set(s, 0.35, 0.2, 0.35);
	{
		const wheel = world.debugCubes[i++];
		quat.identity(q);
		quat.rotateZ(q, q, world.car.steering);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[i++];
		v[1] *= -1;
		quat.identity(q);
		quat.rotateZ(q, q, world.car.steering);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[i++];
		v[0] *= -1;
		quat.identity(q);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[i++];
		v[1] *= -1;
		quat.identity(q);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}
	{
		const antenna = world.debugCubes[i++];
		vec3.set(v, 0, 0, 0);
		vec3.set(s, 0.012, 0.012, 5);
		quat.identity(q);
		mat4.fromRotationTranslationScale(antenna, q, v, s);
		mat4.multiply(antenna, m, antenna);
	}

	for (const bone of world.car.bones) {
		const b = world.debugCubes[i++];
		vec3.copy(v, bone.localPosition);
		vec3.set(s, 0.1, 0.1, 0.1);
		quat.identity(q);
		mat4.fromRotationTranslationScale(b, q, v, s);
		mat4.multiply(b, m, b);
	}

	//
	// collision
	//
	{
		const collisions = getSphereCollision(
			world,
			[
				world.car.position[0],
				world.car.position[1],
				world.car.position[2] + 0.1,
			],
			1.1,
		);
		for (const c of collisions) {
			const u = (1 - Math.min(1, Math.max(c.distance, 0.01))) ** 2 * 0.2;
			{
				const cube = world.debugCubes[i++];
				vec3.copy(v, c.contactPoint);
				vec3.set(s, u, u, u);
				quat.identity(q);
				mat4.fromRotationTranslationScale(cube, q, v, s);
			}
			{
				const cube = world.debugCubes[i++];
				vec3.scaleAndAdd(v, c.contactPoint, c.normal, 0.6 * u);
				vec3.set(s, 0.5 * u, 0.5 * u, 0.5 * u);
				quat.identity(q);
				mat4.fromRotationTranslationScale(cube, q, v, s);
			}
		}
	}

	while (i < world.debugCubes.length) mat4.identity(world.debugCubes[i++]);
};
