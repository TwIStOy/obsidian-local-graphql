import { extendType, stringArg } from "nexus";
import { prepareFuzzySearch, Vault } from "obsidian";
import { Context } from "../../context";
import { GraphQLObject } from "../base";
import { objectType } from "../wrapper/block";
import { SearchResultContext } from "./search";

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
        t.list.field("allLoadedFiles", {
            objectName: "TAbstractFile",
            description: "Get all files and folders in the vault.",
            resolve(val) {
                return val.getAllLoadedFiles() ?? [];
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
        t.list.field("allMarkdownFiles", {
            objectName: "TFile",
            description: "Get all markdown files in the vault.",
            resolve(val) {
                return val.getMarkdownFiles() ?? [];
            },
        });
        t.list.field("allFiles", {
            objectName: "TFile",
            description: "Get all files in the vault.",
            resolve(val) {
                return val.getFiles() ?? [];
            },
        });
        t.list.field("fuzzySearch", {
            objectName: "SearchResultContext",
            args: {
                query: "String",
            },
            async resolve(val, args) {
                let search = prepareFuzzySearch(args.query);
                let files = val.getMarkdownFiles();
                let results: SearchResultContext[] = [];
                for (let file of files) {
                    let content = await val.cachedRead(file);
                    let fileResult = search(content);
                    if (fileResult) {
                        results.push({
                            file,
                            ...fileResult,
                        });
                    }
                }
                results.sort((a, b) => b.score - a.score);
                return results;
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

export const VaultMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nullable.field("createFolder", {
            type: "TFolder",
            description: "Create a new folder inside the vault.",
            args: {
                path: stringArg({
                    description: "Vault absolute path for the new folder.",
                }),
            },
            async resolve(_root, args, ctx: Context) {
                try {
                    let folder = await ctx.app.vault.createFolder(args.path);
                    return new GraphQLObject(folder, "TFolder");
                } catch (error) {
                    console.log(error);
                }
                return null;
            },
        });
    },
});
