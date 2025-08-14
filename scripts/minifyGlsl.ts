export const minifyGlsl = (code: string) =>
	code
		// remove comment
		.replaceAll(/\/\/[^\n]*/g, "\n")

		// merge line break
		.replaceAll(/\s*\n\s*/g, "\n")

		// merge white spaces
		.replace(/[\t ]+/g, " ")

		// remove white spaces when not between two words
		.replaceAll(/([^\w]) +/g, "$1")
		.replaceAll(/ +([^\w])/g, "$1")

		// remove line break after semicolon or curly braces
		.replaceAll(/([;{}])\n/g, "$1")

		.trim();

/**
 * look for in / out parameters or uniform names and replace them in the whole js code
 * quite dangerous
 */
export const mangleGlslVariable = (jsCode: string) => {
	const variableNames = Array.from(
		new Set(
			Array.from(
				jsCode.matchAll(/(in|out|uniform)\s+(vec4|vec3|mat4|mat3)\s+(\w+)/g),
			).map(([_0, _1, _2, v]) => v),
		),
	);

	const map = new Map(
		variableNames.map((name, i) => [name, "v" + (i + 10).toString(36)]),
	);

	const re = new RegExp(`\\W(` + variableNames.join("|") + `)\\W`, "g");

	return jsCode.replaceAll(re, (a, v) => a.replace(v, map.get(v)!));
};
