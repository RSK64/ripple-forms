import { Path } from "../types/path";

/**
 * Converts a property path (dot/bracket notation or array form) into an array of string/number segments.
 *
 * Examples:
 * ```ts
 * toPath("a.b.c");            // ["a", "b", "c"]
 * toPath("a[0].b");           // ["a", 0, "b"]
 * toPath(["a", 0, "b"]);      // ["a", 0, "b"]
 * ```
 *
 * @param {string | (string | number)[]} name - The path to convert.
 *   - If a string, it can include dot notation (`"a.b"`) or bracket notation (`"a[0].b"`).
 *   - If an array, it is returned as-is.
 * @returns {(string | number)[]} An array of path segments, where numeric indices are converted to numbers.
 */
export function toPath<T>(name: Path<T>) :(string | number)[] {
	if (Array.isArray(name)) return name;
	const parts: (string | number)[] = [];
	name.toString()
		.split('.')
		.forEach((segment) => {
			const re = /([^\[]+)|\[(\d+)\]/g;
			let m;
			while ((m = re.exec(segment))) {
				if (m[1]) parts.push(m[1]);
				if (m[2]) parts.push(Number(m[2]));
			}
		});
	return parts;
}
