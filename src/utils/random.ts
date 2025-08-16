//@ts-ignore
import hash from "hash-int";

export const createRandom = (seed = 3129583781) => {
	let n = seed;
	return () => {
		n = hash(n + 423801);
		return (n % 543949) / 543949;
	};
};
