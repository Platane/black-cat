import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

export const bundle = async () => {
	const listFiles = (filename: string): string[] => {
		const stat = fs.statSync(filename);
		if (stat.isFile()) return [filename];
		if (stat.isDirectory())
			return fs
				.readdirSync(filename)
				.map((f) => listFiles(path.join(filename, f)))
				.flat();
		return [];
	};

	const distDir = path.join(__dirname, "/../dist/");

	execFileSync("advzip", [
		"--add",
		"--shrink-insane",
		distDir + "bundle.zip",
		...listFiles(distDir).filter(
			(f) =>
				f !== distDir + "bundle.zip" && f !== distDir + "shieldio_size.json",
		),
	]);

	//
	// write size info
	{
		const size = fs.statSync(distDir + "bundle.zip").size;
		const literalSize = (size / 1024).toFixed(2) + "K";
		const content = {
			label: "size",
			message: literalSize,
			color: size < 13312 ? "success" : "important",
		};
		fs.writeFileSync(distDir + "shieldio_size.json", JSON.stringify(content));

		console.log(literalSize);
	}
};

bundle();
