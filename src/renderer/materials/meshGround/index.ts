import { createProgram } from "../../../utils/gl";
import fragmentShaderCode from "./shader.frag?raw";
import vertexShaderCode from "./shader.vert?raw";

export const createMaterialGround = (gl: WebGL2RenderingContext) => {
	const program = createProgram(gl, vertexShaderCode, fragmentShaderCode);

	const u_projectionMatrix = gl.getUniformLocation(
		program,
		"u_projectionMatrix",
	);
	const u_viewMatrix = gl.getUniformLocation(program, "u_viewMatrix");

	const a_position = gl.getAttribLocation(program, "a_position");
	const a_normal = gl.getAttribLocation(program, "a_normal");
	const a_color = gl.getAttribLocation(program, "a_color");

	const createBufferSet = () => {
		const vao = gl.createVertexArray();
		const buffer = gl.createBuffer();

		const set = { vao, buffer, nVertices: 0 };

		gl.bindVertexArray(vao);
		linkBufferAttribute(set.buffer);

		return set;
	};

	const linkBufferAttribute = (buffer: WebGLBuffer) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(a_position);
		gl.vertexAttribPointer(
			a_position,
			3,
			gl.FLOAT,
			false,
			3 * 3 * 4,
			0 * 3 * 4,
		);

		gl.enableVertexAttribArray(a_normal);
		gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 3 * 3 * 4, 1 * 3 * 4);

		gl.enableVertexAttribArray(a_color);
		gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 3 * 3 * 4, 2 * 3 * 4);
	};

	const updateBufferSet = (
		set: ReturnType<typeof createBufferSet>,
		interleaved: Float32Array,
		nVertices: number,
	) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, set.buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			interleaved,
			gl.STATIC_DRAW,
			0,
			nVertices * 9,
		);
		set.nVertices = nVertices;
	};

	const disposeBufferSet = (set: ReturnType<typeof createBufferSet>) => {
		gl.deleteBuffer(set.buffer);
	};

	const render = (
		projectionMatrix: Float32Array,
		viewMatrix: Float32Array,
		{ vao, nVertices }: ReturnType<typeof createBufferSet>,
	) => {
		gl.useProgram(program);

		gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);

		gl.bindVertexArray(vao);

		gl.drawArrays(gl.TRIANGLES, 0, nVertices);
	};

	return {
		render,
		createBufferSet,
		linkBufferAttribute,
		updateBufferSet,
		disposeBufferSet,
	};
};
