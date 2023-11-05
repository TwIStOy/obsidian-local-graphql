import { NexusObjectTypeDef } from "nexus/dist/core";

/**
 * A GraphQL object that represents an Obsidian object.
 */
export abstract class GraphQLObject<T> {
	/**
	 * The Obsidian object that this GraphQL object represents.
	 */
	protected _ob: T;

	constructor(ob: T) {
		this._ob = ob;
	}
}


