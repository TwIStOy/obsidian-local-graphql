import { interfaceType, objectType } from "nexus";
import { FileStats, TAbstractFile, TFile, TFolder } from "obsidian";

import { GraphQLObject } from "./base";
import { VaultObject } from "./vault";
import { obObjectType, obInterfaceType } from "./util";

export const FileStatsSchema = obObjectType<FileStats>()({
    name: "FileStats",
    definition(t) {
        t.int("size");
        t.string("mtime");
        t.string("ctime");
    },
});

export const TAbstractFileSchema = obInterfaceType<TAbstractFile>()({
    name: "TAbstractFile",
    definition(t) {
        t.string("name");
        t.string("path");
        t.field("vault", "Vault");
        t.field("parent", "TFolder", {
            nullable: true,
        });
    },
});

export const TFileSchema = obObjectType<TFile>()({
    name: "TFile",
    definition(t) {
        t.implements("TAbstractFile");
        t.string("basename");
        t.string("extension");
        t.field("stat", "FileStats");
        t.string("readContent", {
            nullable: false,
            resolve: async (val) => {
                return await val.vault.read(val);
            },
        });
        t.string("cachedreadContent");
        t.string("readBinaryContent");
        t.string("resourcePath");
    },
});

export class TFileObject extends GraphQLObject<TFile> {
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
    public _objectName: string = "TFolder";

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
