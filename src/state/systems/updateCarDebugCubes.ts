import { mat4, quat, vec3 } from "gl-matrix";
import { World } from "../world/type";

const m = mat4.create();
const v = vec3.create();
const s = vec3.create();
const q = quat.create();
export const updateCarDebugCubes = (world: World) => {
	while (world.debugCubes.length < 6)
		world.debugCubes.push(new Float32Array(16));

	vec3.copy(v, world.car.position);
	vec3.set(s, 1, 1, 1);
	quat.copy(q, world.car.rotation);
	mat4.fromRotationTranslationScale(m, q, v, s);

	{
		const body = world.debugCubes[0];
		vec3.set(v, 0, 0, 0.44);
		vec3.set(s, 1, 0.6, 0.3);
		quat.identity(q);
		mat4.fromRotationTranslationScale(body, q, v, s);
		mat4.multiply(body, m, body);
	}
	{
		const body = world.debugCubes[1];
		vec3.set(v, -0.2, 0, 0.93);
		vec3.set(s, 0.5, 0.6, 0.2);
		quat.identity(q);
		mat4.fromRotationTranslationScale(body, q, v, s);
		mat4.multiply(body, m, body);
	}

	vec3.set(s, 0.35, 0.16, 0.35);
	vec3.set(v, 0.8, 0.75, 0.35 / 2);
	{
		const wheel = world.debugCubes[2];
		quat.identity(q);
		const a = Math.atan2(world.car.direction[1], world.car.direction[0]);
		quat.rotateZ(q, q, a);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[3];
		v[1] *= -1;
		quat.identity(q);
		const a = Math.atan2(world.car.direction[1], world.car.direction[0]);
		quat.rotateZ(q, q, a);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[4];
		v[0] *= -1;
		quat.identity(q);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[5];
		v[1] *= -1;
		quat.identity(q);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}
};
