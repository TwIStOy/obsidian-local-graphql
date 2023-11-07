import { extendType } from "nexus";
import { Vault } from "obsidian";

import { anyGraphQLObject } from "./base";
import { Context } from "../context";
import { obObjectType } from "./util";

export const VaultSchema = obObjectType<Vault>()({
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
        t.field("root", "TFolder", {
            description: "Get the root folder of the current vault.",
            resolve(val) {
                return val.getRoot();
            },
        });
        t.list().field("allLoadedFiles", "TAbstractFile", {
            description: "Get all files and folders in the vault.",
            resolve(val) {
                return val.getAllLoadedFiles();
            },
        });
        t.field("abstractFileByPath", "TAbstractFile", {
            nullable: true,
            args: {
                path: "String",
            },
            resolve(val, args) {
                return val.getAbstractFileByPath(args.path);
            },
        });
        t.list().field("allMarkdownFiles", "TFile", {
            description: "Get all markdown files in the vault.",
            resolve(val) {
                return val.getMarkdownFiles();
            },
        });
        t.list().field("allFiles", "TFile", {
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
                return anyGraphQLObject(ctx.app.vault, "Vault");
            },
        });
    },
});
