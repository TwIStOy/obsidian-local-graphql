import { extendType, objectType } from "nexus";
import { Vault } from "obsidian";

import { GraphQLObject } from "./base";
import { TAbstractFileObject, TFolderObject } from "./file";
import { Context } from "../context";

export class VaultObject extends GraphQLObject<Vault> {
	public static schema = objectType({
		name: "Vault",
		definition(t) {
			t.nonNull.string("name");
			t.nonNull.string("configDir");
			t.nonNull.field("root", {
				type: "TFolder",
			});
			t.nonNull.list.field("allLoadedFiles", {
				type: "TAbstractFile",
			});
			t.nullable.field("abstractFileByPath", {
				type: "TAbstractFile",
				args: {
					path: "String",
				},
			});
		},
	});

	constructor(ob: Vault) {
		super(ob);
	}

	get name() {
		return this._ob.getName();
	}

	get configDir() {
		return this._ob.configDir;
	}

	get root() {
		return new TFolderObject(this._ob.getRoot());
	}

	get allLoadedFiles() {
		let values = this._ob
			.getAllLoadedFiles()
			.map(TAbstractFileObject.fromObsidian);
		return values;
	}

	abstractFileByPath(args: { path: string }) {
		let ob = this._ob.getAbstractFileByPath(args.path);
		if (ob) {
			return TAbstractFileObject.fromObsidian(ob);
		}
		return null;
	}
}

export const VaultQuery = extendType({
	type: "Query",
	definition(t) {
		t.nonNull.field("vault", {
			type: "Vault",
			resolve(_root, _args, ctx: Context) {
				return new VaultObject(ctx.app.vault);
			},
		});
	},
});
