import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { Plugin } from "rollup";

/**
 * use vite syntax with ?url and ?raw to import assets
 */
export const importAsset = ({
	transform,
}: {
	transform?: (id: string, content: Buffer) => Buffer | string | undefined;
}): Plugin => {
	const name = "rollup-plugin-import-asset";
	const rawPrefix = name + "-raw-";
	const urlPrefix = name + "-url-";

	let assetNames = new Map();

	return {
		name,
		resolveId(id, importer) {
			if (!importer) return;

			if (id.endsWith("?raw")) {
				const filename = path.resolve(path.dirname(importer), id.slice(0, -4));
				return rawPrefix + filename;
			}
			if (id.endsWith("?url")) {
				const filename = path.resolve(path.dirname(importer), id.slice(0, -4));
				return urlPrefix + filename;
			}
		},
		load(id) {
			if (id.startsWith(rawPrefix)) {
				const filename = id.slice(rawPrefix.length);
				let content: Buffer | string = fs.readFileSync(filename);
				content = transform?.(filename, content) ?? content;
				return `export default ${JSON.stringify(content.toString())}`;
			}

			if (id.startsWith(urlPrefix)) {
				const filename = id.slice(rawPrefix.length);
				const ext = path.extname(id);
				const buffer = fs.readFileSync(filename);
				const hash = crypto
					.createHash("sha1")
					.update(buffer)
					.digest("hex")
					.slice(0, 16);

				let name = assetNames.get(hash);
				if (!name) {
					name = assetNames.size.toString();
					assetNames.set(hash, name);
					this.emitFile({
						type: "asset",
						fileName: name,
						source: transform?.(filename, buffer) ?? buffer,
					});
				}

				return `export default ${JSON.stringify(name)}`;
			}
		},
	};
};
