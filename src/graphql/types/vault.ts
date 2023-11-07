import { extendType } from "nexus";
import { Vault } from "obsidian";
import { Context } from "../../context";
import { GraphQLObject } from "../base";
import { objectType } from "../wrapper/block";

export const VaultSchema = objectType<Vault>()({
    name: "Vault",
    definition(t) {
        t.string("name", {
            resolve(val) {
                return val.getName();
            },
        });
        t.string("configDir", {
            resolve(val) {
                return val.configDir;
            },
        });
        t.field("root", {
            objectName: "TFolder",
            description: "Get the root folder of the current vault.",
            resolve(val) {
                return val.getRoot();
            },
        });
        t.list().field("allLoadedFiles", {
            objectName: "TAbstractFile",
            description: "Get all files and folders in the vault.",
            resolve(val) {
                return val.getAllLoadedFiles();
            },
        });
        t.field("abstractFileByPath", {
            objectName: "TAbstractFile",
            nullable: true,
            args: {
                path: "String",
            },
            resolve(val, args) {
                return val.getAbstractFileByPath(args.path);
            },
        });
        t.list().field("allMarkdownFiles", {
            objectName: "TFile",
            description: "Get all markdown files in the vault.",
            resolve(val) {
                return val.getMarkdownFiles();
            },
        });
        t.list().field("allFiles", {
            objectName: "TFile",
            description: "Get all files in the vault.",
            resolve(val) {
                return val.getFiles();
            },
        });
    },
});

export const VaultQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("vault", {
            type: "Vault",
            resolve(_root, _args, ctx: Context) {
                return new GraphQLObject(ctx.app.vault, "Vault");
            },
        });
    },
});
