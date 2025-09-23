/**
 * @description This function takes two objects and compares them recursively. It returns true if both objects are the same. 
 * @param {any} object1
 * @param {any} object2
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compareObjectsDeep(object1: any, object2: any): boolean {
	const objectKeys = Object.keys;
	const object1Type = typeof object1
	const object2Type = typeof object2;

	return object1 && object2 && object1Type === 'object' && object1Type === object2Type ? (
		objectKeys(object1).length === objectKeys(object2).length && 
		objectKeys(object1).every(key => compareObjectsDeep(object1[key], object2[key]))
	) : (object1 === object2);
}