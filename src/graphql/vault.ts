import { extendType, objectType } from "nexus";
import { TFile, Vault } from "obsidian";

import { GraphQLObject } from "./base";
import { TAbstractFileObject, TFileObject, TFolderObject } from "./file";
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
			t.nullable.string("fileContent", {
				args: {
					path: "String",
				},
			});
			t.nullable.string("cachedFileContent", {
				args: {
					path: "String",
				},
			});
			t.nullable.string("fileBinary", {
				args: {
					path: "String",
				},
			});
			t.nullable.string("resourcePath", {
				args: {
					path: "String",
				},
			});
			t.nonNull.list.field("allMarkdownFiles", {
				type: "TFile",
			});
			t.nonNull.list.field("allFiles", {
				type: "TFile",
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

	allLoadedFiles() {
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

	_fileFromPath(path: string) {
		let ob = this._ob.getAbstractFileByPath(path);
		if (ob && ob instanceof TFile) {
			return ob;
		}
		return null;
	}

	fileContent(args: { path: string }) {
		let ob = this._fileFromPath(args.path);
		if (ob) {
			return this._ob.read(ob);
		}
		return null;
	}

	async cachedFileContent(args: { path: string }) {
		let ob = this._fileFromPath(args.path);
		if (ob) {
			return await this._ob.cachedRead(ob);
		}
		return null;
	}

	async fileBinary(args: { path: string }) {
		let ob = this._fileFromPath(args.path);
		if (ob) {
			let data = await this._ob.readBinary(ob);
			return Buffer.from(data).toString("base64");
		}
		return null;
	}

	resourcePath(args: { path: string }) {
		let ob = this._fileFromPath(args.path);
		if (ob) {
			return this._ob.getResourcePath(ob);
		}
		return null;
	}

	allMarkdownFiles() {
		let values = this._ob.getMarkdownFiles().map((f) => new TFileObject(f));
		return values;
	}

	allFiles() {
		let values = this._ob.getFiles().map((f) => new TFileObject(f));
		return values;
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
