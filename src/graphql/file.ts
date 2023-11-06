import { interfaceType, objectType } from "nexus";
import { FileStats, TAbstractFile, TFile, TFolder } from "obsidian";

import { GraphQLObject } from "./base";
import { VaultObject } from "./vault";

export class FileStatsObject extends GraphQLObject<FileStats> {
	public static schema = objectType({
		name: "FileStats",
		definition(t) {
			t.int("size");
			t.string("mtime");
			t.string("ctime");
		},
	});

	constructor(ob: FileStats) {
		super(ob);
	}

	get size() {
		return this._ob.size;
	}

	get mtime() {
		return this._ob.mtime;
	}

	get ctime() {
		return this._ob.ctime;
	}
}

export class TAbstractFileObject {
	public static schema = interfaceType({
		name: "TAbstractFile",
		definition(t) {
			t.string("name");
			t.string("path");
			t.field("vault", { type: "Vault" });
			t.nullable.field("parent", { type: "TFolder" });
		},
		resolveType(ob: any) {
			if (ob instanceof TFileObject) {
				return "TFile";
			} else if (ob instanceof TFolderObject) {
				return "TFolder";
			}
			throw new Error("Unknown TAbstractFile type");
		},
	});

	static fromObsidian(ob: TAbstractFile) {
		if (ob instanceof TFile) {
			return new TFileObject(ob);
		} else if (ob instanceof TFolder) {
			return new TFolderObject(ob);
		}
		throw new Error("Unknown TAbstractFile type");
	}
}

export class TFileObject extends GraphQLObject<TFile> {
	public static schema = objectType({
		name: "TFile",
		definition(t) {
			t.implements("TAbstractFile");
			t.string("basename");
			t.string("extension");
			t.field("stats", { type: "FileStats" });
			t.string("readContent");
			t.string("cachedreadContent");
			t.string("readBinaryContent");
			t.string("resourcePath");
		},
	});

	constructor(ob: TFile) {
		super(ob);
	}

	get vault() {
		return new VaultObject(this._ob.vault);
	}

	get name() {
		return this._ob.name;
	}

	get path() {
		return this._ob.path;
	}

	get parent(): TFolderObject | null {
		if (!this._ob.parent) {
			return null;
		}
		return new TFolderObject(this._ob.parent);
	}

	get stats() {
		return new FileStatsObject(this._ob.stat);
	}

	get basename() {
		return this._ob.basename;
	}

	get extension() {
		return this._ob.extension;
	}

	async readContent() {
		return await this._ob.vault.read(this._ob);
	}

	async cachedreadContent() {
		return await this._ob.vault.cachedRead(this._ob);
	}

	async readBinaryContent() {
		let data = await this._ob.vault.readBinary(this._ob);
		return Buffer.from(data).toString("base64");
	}

	resourcePath() {
		return this._ob.vault.getResourcePath(this._ob);
	}
}

export class TFolderObject extends GraphQLObject<TFolder> {
	public static schema = objectType({
		name: "TFolder",
		definition(t) {
			t.implements("TAbstractFile");
			t.nullable.boolean("isRoot");
			t.list.field("children", { type: "TAbstractFile" });
		},
	});

	constructor(ob: TFolder) {
		super(ob);
	}

	get vault() {
		return new VaultObject(this._ob.vault);
	}

	get name() {
		return this._ob.name;
	}

	get path() {
		return this._ob.path;
	}

	get isRoot() {
		return this._ob.isRoot();
	}

	get children(): (TFileObject | TFolderObject)[] {
		return this._ob.children.map(TAbstractFileObject.fromObsidian);
	}

	get parent(): TFolderObject | null {
		if (this._ob.parent) {
			return new TFolderObject(this._ob.parent);
		}
		return null;
	}
}
