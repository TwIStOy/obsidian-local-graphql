import { objectType } from "nexus";
import { Reference } from "obsidian";

import { GraphQLObject } from "./base";

export class ReferenceObject extends GraphQLObject<Reference> {
	public static schema = objectType({
		name: "Reference",
		definition(t) {
			t.string("link");
			t.string("original");
			t.nullable.string("displayText");
		},
	});

	constructor(ob: Reference) {
		super(ob);
	}

	get link() {
		return this._ob.link;
	}

	get original() {
		return this._ob.original;
	}

	get displayText() {
		return this._ob.displayText;
	}
}
