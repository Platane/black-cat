export const createProgram = <U extends string, A extends string>(
	gl: WebGLRenderingContext,
	vertexShaderCode: string,
	fragmentShaderCode: string,
	uniformNames: U[] = [],
	attributeNames: A[] = [],
) => {
	const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
	gl.shaderSource(vertexShader, vertexShaderCode);
	gl.compileShader(vertexShader);
	if (
		process.env.NODE_ENV !== "production" &&
		!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)
	)
		throw "vertex shader error: " + gl.getShaderInfoLog(vertexShader) || "";

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
	gl.shaderSource(fragmentShader, fragmentShaderCode);
	gl.compileShader(fragmentShader);
	if (
		process.env.NODE_ENV !== "production" &&
		!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)
	)
		throw "fragment shader error: " + gl.getShaderInfoLog(fragmentShader) || "";

	const program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	if (
		process.env.NODE_ENV !== "production" &&
		!gl.getProgramParameter(program, gl.LINK_STATUS)
	)
		throw "Unable to initialize the shader program.";

	const uniforms = Object.fromEntries(
		uniformNames.map((name) => {
			const l = gl.getUniformLocation(program, name);
			if (process.env.NODE_ENV !== "production" && l === null)
				throw `Uniform ${name} not found`;
			return [name, l];
		}),
	) as Record<U, WebGLUniformLocation>;

	const attributes = Object.fromEntries(
		attributeNames.map((name) => {
			const l = gl.getAttribLocation(program, name);
			if (process.env.NODE_ENV !== "production" && l === -1)
				throw `Attribute ${name} not found`;
			return [name, l];
		}),
	) as Record<A, number>;

	return Object.assign(program, { u: uniforms, a: attributes });
};
