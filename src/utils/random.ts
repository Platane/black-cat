/**
 * from https://github.com/mikolalysenko/hash-int
 */
export const hashInt = (x: number) => {
	A[0] = x | 0;
	A[0] -= A[0] << 6;
	A[0] ^= A[0] >>> 17;
	A[0] -= A[0] << 9;
	A[0] ^= A[0] << 4;
	A[0] -= A[0] << 3;
	A[0] ^= A[0] << 10;
	A[0] ^= A[0] >>> 15;
	return A[0];
};
const A = new Uint32Array(1);

export const createRandom = (seed = 543949) => {
	let n = seed;
	return () => {
		n = hashInt(n);
		return (n % 543949) / 543949;
	};
};
