import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { minify as minifyHtml } from "html-minifier-terser";
import { OutputChunk, rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import css from "rollup-plugin-import-css";
import { minify as minifyJs } from "terser";
import pkg from "../package.json";
import { mangleGlslVariable, minifyGlsl } from "./minifyGlsl";
import { importAsset } from "./rollup-plugin-import-asset";

export const build = async () => {
	// bundle with rollup
	const bundle = await rollup({
		input: __dirname + "/../src/index.ts",

		plugins: [
			commonjs(),

			resolve({
				extensions: [".ts", ".js"],
			}),

			css(),

			esbuild({
				include: ["**/*.ts"],
				exclude: /node_modules/,
				sourceMap: false,
				target: "es2024",
				define: {
					"process.env.NODE_ENV": '"production"',
				},
			}),

			importAsset({
				transform: (filename, content) => {
					if (filename.endsWith(".frag") || filename.endsWith(".vert"))
						return minifyGlsl(content.toString());
				},
			}),
		],
	});

	const { output } = await bundle.generate({ format: "es", sourcemap: false });

	let { code: jsCode } = output.find(
		(chunk) => chunk.type === "chunk" && chunk.isEntry,
	) as OutputChunk;

	// rename glsl attributes / uniforms
	jsCode = mangleGlslVariable(jsCode);

	// minify with terser
	{
		const out = await minifyJs(jsCode, {
			compress: {
				keep_infinity: true,
				pure_getters: true,
				unsafe_arrows: true,
				unsafe_math: true,
				unsafe_methods: true,
				inline: true,
				booleans_as_integers: true,
				passes: 10,
			},
			format: {
				wrap_func_args: false,
				comments: false,
			},
			mangle: { properties: true, toplevel: true },
			ecma: 2020,
			toplevel: true,
		});
		jsCode = out.code!;
	}

	let cssCode = output
		.map((a) =>
			a.type === "asset" && a.fileName.endsWith(".css") ? a.source : null,
		)
		.filter(Boolean)
		.join("\n");

	let htmlContent = fs.readFileSync(__dirname + "/../src/index.html", "utf8");

	htmlContent = htmlContent.replace(
		'<script type="module" src="./index.ts"></script>',
		`<script>${jsCode}</script>`,
	);

	if (cssCode)
		htmlContent = htmlContent.replace(
			"</head>",
			`<style>${cssCode}</style></head>`,
		);

	htmlContent = await minifyHtml(htmlContent, {
		collapseWhitespace: true,
		useShortDoctype: true,
		minifyCSS: true,
		minifyJS: false,
	});

	const distDir = __dirname + "/../dist/";

	try {
		fs.rmSync(distDir, { recursive: true });
	} catch (err) {}
	fs.mkdirSync(distDir, { recursive: true });

	fs.writeFileSync(distDir + "index.html", htmlContent);
	for (const a of output) {
		if (a.type === "asset" && !a.fileName.endsWith(".css")) {
			fs.writeFileSync(distDir + a.fileName, a.source);
		}
	}

	// zip
	execFileSync("advzip", [
		"--add",
		"--shrink-insane",
		distDir + "bundle.zip",
		...fs.readdirSync(distDir).map((f) => distDir + f),
	]);
	const size = fs.statSync(distDir + "bundle.zip").size;
	const sizeStr = (size / 1024).toFixed(2) + "K";
	console.log(sizeStr);

	// inject footer
	htmlContent = htmlContent.replace(
		"</body>",
		"<footer>" +
			`${sizeStr} ` +
			`<a href="${"bundle.zip"}">bundle.zip</a>` +
			" " +
			`<a href="${pkg.repository.replace("github:", "https://github.com/")}">gitHub</a>` +
			"</footer>" +
			"</body>",
	);
	fs.writeFileSync(distDir + "index.html", htmlContent);
};

build();
