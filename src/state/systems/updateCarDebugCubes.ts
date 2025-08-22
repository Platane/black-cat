import { mat4, quat, vec3 } from "gl-matrix";
import { World } from "../world/type";
import { getSphereCollision } from "./utils-ground";

const m = mat4.create();
const v = vec3.create();
const s = vec3.create();
const q = quat.create();
export const updateCarDebugCubes = (world: World) => {
	vec3.copy(v, world.car.position);
	v[2] += 2;
	vec3.set(s, 1, 1, 1);
	quat.copy(q, world.car.rotation);
	mat4.fromRotationTranslationScale(m, q, v, s);

	{
		const body = world.debugCubes[world.debugCubesIndex++];
		vec3.set(v, 0, 0, 0.3);
		vec3.set(s, 1, 0.6, 0.3);
		quat.identity(q);
		mat4.fromRotationTranslationScale(body, q, v, s);
		mat4.multiply(body, m, body);
	}
	{
		const body = world.debugCubes[world.debugCubesIndex++];
		vec3.set(v, -0.15, 0, 0.55);
		vec3.set(s, 0.5, 0.6, 0.2);
		quat.identity(q);
		mat4.fromRotationTranslationScale(body, q, v, s);
		mat4.multiply(body, m, body);
	}

	vec3.set(v, 0.4, 0.4, 0.35 / 2);
	vec3.set(s, 0.35, 0.2, 0.35);
	{
		const wheel = world.debugCubes[world.debugCubesIndex++];
		quat.identity(q);
		quat.rotateZ(q, q, world.car.steering);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[world.debugCubesIndex++];
		v[1] *= -1;
		quat.identity(q);
		quat.rotateZ(q, q, world.car.steering);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[world.debugCubesIndex++];
		v[0] *= -1;
		quat.identity(q);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}

	{
		const wheel = world.debugCubes[world.debugCubesIndex++];
		v[1] *= -1;
		quat.identity(q);
		mat4.fromRotationTranslationScale(wheel, q, v, s);
		mat4.multiply(wheel, m, wheel);
	}
	{
		const antenna = world.debugCubes[world.debugCubesIndex++];
		vec3.set(v, 0, 0, 0);
		vec3.set(s, 0.012, 0.012, 5);
		quat.identity(q);
		mat4.fromRotationTranslationScale(antenna, q, v, s);
		mat4.multiply(antenna, m, antenna);
	}

	for (const bone of world.car.bones) {
		const b = world.debugCubes[world.debugCubesIndex++];
		vec3.copy(v, bone.localPosition);
		vec3.set(s, 0.1, 0.1, 0.1);
		quat.identity(q);
		mat4.fromRotationTranslationScale(b, q, v, s);
		mat4.multiply(b, m, b);
	}
};
