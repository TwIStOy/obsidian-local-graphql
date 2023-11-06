/**
 * A GraphQL object that represents an Obsidian object.
 */
export interface GraphQLObject<T> {
	/**
	 * The Obsidian object that this GraphQL object represents.
	 */
	_ob: T;
	/**
	 * The name of this GraphQL object.
	 */
	readonly _objectName: string;
}

export interface GraphQLObjectDispatcher {
	tester: (ob: any) => boolean;
	objectName: string;
}

var graphQLObjectObjectNames: GraphQLObjectDispatcher[] = [];

type Constructor<T> = new (...args: any[]) => T;

function ofType<T>(obj: any, type: Constructor<T>): obj is T {
	return obj instanceof type;
}

export function registerObject(objectName: string, type: Constructor<any>) {
	let tester = (obj: any) => {
		return ofType(obj, type);
	};
	graphQLObjectObjectNames.push({
		tester: tester,
		objectName: objectName,
	});
}

export function anyGraphQLObject(
	ob: any,
	objectName: string,
): GraphQLObject<any> | null {
	if (ob == null) {
		return null;
	}

	for (let dispatcher of graphQLObjectObjectNames) {
		if (dispatcher.tester(ob)) {
			return {
				_ob: ob,
				_objectName: dispatcher.objectName,
			};
		}
	}

	return {
		_ob: ob,
		_objectName: objectName,
	};
}
