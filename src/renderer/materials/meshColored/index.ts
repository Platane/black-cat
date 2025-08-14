import fragmentShaderCode from "./shader.frag?raw";
import vertexShaderCode from "./shader.vert?raw";

export const createMaterialColored = (gl: WebGL2RenderingContext) => {
	const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
	gl.shaderSource(vertexShader, vertexShaderCode);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
		throw "vertex shader error: " + gl.getShaderInfoLog(vertexShader) || "";

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
	gl.shaderSource(fragmentShader, fragmentShaderCode);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
		throw "fragment shader error: " + gl.getShaderInfoLog(fragmentShader) || "";

	const program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS))
		throw "Unable to initialize the shader program.";

	const u_projectionMatrix = gl.getUniformLocation(
		program,
		"u_projectionMatrix",
	);
	const u_viewMatrix = gl.getUniformLocation(program, "u_viewMatrix");
	const u_objectMatrix = gl.getUniformLocation(program, "u_objectMatrix");

	const a_position = gl.getAttribLocation(program, "a_position");
	const a_color = gl.getAttribLocation(program, "a_color");

	// gl.vertexAttrib3f(a_color, 0.3, 0.4, 0.1);

	const createBufferSet = () => {
		const vao = gl.createVertexArray();
		const buffer = {
			positions: gl.createBuffer(),
			colors: gl.createBuffer(),
		};

		const set = { vao, buffer, nVertices: 0 };

		gl.bindVertexArray(vao);
		linkBufferAttribute(set.buffer);

		return set;
	};

	const linkBufferAttribute = (
		buffer: ReturnType<typeof createBufferSet>["buffer"],
	) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positions);
		gl.enableVertexAttribArray(a_position);
		gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.colors);
		gl.enableVertexAttribArray(a_color);
		gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
	};

	const updateBufferSet = (
		set: ReturnType<typeof createBufferSet>,
		o: {
			positions?: Float32Array;
			colors?: Float32Array;
		},
	) => {
		if (o.positions) {
			gl.bindBuffer(gl.ARRAY_BUFFER, set.buffer.positions);
			gl.bufferData(gl.ARRAY_BUFFER, o.positions, gl.STATIC_DRAW);
			set.nVertices = o.positions.length / 3;
		}
		if (o.colors) {
			gl.bindBuffer(gl.ARRAY_BUFFER, set.buffer.colors);
			gl.bufferData(gl.ARRAY_BUFFER, o.colors, gl.STATIC_DRAW);
		}
	};
	const disposeBufferSet = (set: ReturnType<typeof createBufferSet>) => {
		gl.deleteBuffer(set.buffer.positions);
		gl.deleteBuffer(set.buffer.colors);
	};

	const render = (
		projectionMatrix: Float32Array,
		viewMatrix: Float32Array,
		objectMatrix: Float32Array,
		{ vao, nVertices }: ReturnType<typeof createBufferSet>,
	) => {
		gl.useProgram(program);

		gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
		gl.uniformMatrix4fv(u_objectMatrix, false, objectMatrix);

		gl.bindVertexArray(vao);

		gl.drawArrays(gl.TRIANGLES, 0, nVertices);
	};

	const dispose = () => {
		gl.deleteProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
	};

	return {
		render,
		createBufferSet,
		linkBufferAttribute,
		updateBufferSet,
		disposeBufferSet,
		dispose,
	};
};
