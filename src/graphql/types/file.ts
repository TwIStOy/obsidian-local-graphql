import { FileStats, TAbstractFile, TFile, TFolder } from "obsidian";
import { Context } from "../../context";
import { registerObject } from "../base";
import { interfaceType, objectType } from "../wrapper/block";

export const FileStatsSchema = objectType<FileStats>()({
    name: "FileStats",
    definition(t) {
        t.int("size");
        t.string("mtime");
        t.string("ctime");
    },
});

export const TAbstractFileSchema = interfaceType<TAbstractFile>()({
    name: "TAbstractFile",
    definition(t) {
        t.string("name");
        t.string("path");
        t.field("vault", {
            objectName: "Vault",
        });
        t.field("parent", {
            objectName: "TFolder",
            nullable: true,
        });
    },
});

export const TFileSchema = objectType<TFile>()({
    name: "TFile",
    definition(t) {
        registerObject("TFile", TFile);

        t.implements("TAbstractFile");
        t.string("basename");
        t.string("extension");
        t.field("stat", {
            objectName: "FileStats",
        });
        t.string("readContent", {
            async resolve(val) {
                return await val.vault.read(val);
            },
        });
        t.string("cachedreadContent", {
            async resolve(val) {
                return await val.vault.cachedRead(val);
            },
        });
        t.string("readBinaryContent", {
            async resolve(val) {
                let data = await val.vault.readBinary(val);
                return Buffer.from(data).toString("base64");
            },
        });
        t.string("resourcePath", {
            resolve(val) {
                return val.vault.getResourcePath(val);
            },
        });
        t.string("toLinkText", {
            args: {
                sourcePath: "String",
                omitMdExtension: "Boolean",
            },
            resolve(val, args, ctx: Context) {
                return ctx.app.metadataCache.fileToLinktext(
                    val,
                    args.sourcePath,
                    args.omitMdExtension
                );
            },
        });
        t.field("cachedMetadata", {
            objectName: "CachedMetadata",
            nullable: true,
            resolve(val, _, ctx: Context) {
                return ctx.app.metadataCache.getFileCache(val);
            },
        });
    },
});

export const TFolderSchema = objectType<TFolder>()({
    name: "TFolder",
    definition(t) {
        registerObject("TFolder", TFolder);

        t.implements("TAbstractFile");
        t.boolean("isRoot", {
            resolve: (val) => {
                return val.isRoot();
            },
        });
        t.list.field("children", {
            objectName: "TAbstractFile",
            resolve: (val) => {
                return val.children ?? [];
            },
        });
    },
});
