import { mat4, quat, vec3 } from "gl-matrix";
import { World } from "../world/type";

const worldTarget = vec3.create();
const v = vec3.create();
const m = mat4.create();
const m_ = mat4.create();

export const updateCarBones = (world: World) => {
	mat4.fromRotationTranslation(m, world.car.rotation, world.car.position);
	mat4.invert(m_, m);

	for (const bone of world.car.bones) {
		vec3.transformMat4(worldTarget, bone.localTarget, m);

		const tension = 0.02;
		const friction = 0.05;
		const ax =
			-tension * (bone.worldPosition[0] - worldTarget[0]) -
			friction * bone.velocity[0];
		const ay =
			-tension * (bone.worldPosition[1] - worldTarget[1]) -
			friction * bone.velocity[1];
		const az =
			-tension * (bone.worldPosition[2] - worldTarget[2]) -
			friction * bone.velocity[2];

		bone.velocity[0] += ax;
		bone.velocity[1] += ay;
		bone.velocity[2] += az;

		bone.worldPosition[0] += bone.velocity[0];
		bone.worldPosition[1] += bone.velocity[1];
		bone.worldPosition[2] += bone.velocity[2];

		vec3.transformMat4(bone.localPosition, bone.worldPosition, m_);
	}
};
