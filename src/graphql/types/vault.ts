import { extendType, stringArg } from "nexus";
import {
    prepareFuzzySearch,
    prepareSimpleSearch,
    SearchResult,
    Vault,
} from "obsidian";
import { Context } from "../../context";
import { GraphQLObject } from "../base";
import { objectType } from "../wrapper/block";
import { SearchResultContext } from "./search";
import { map } from "fp-ts/Array";
import { flow } from "fp-ts/lib/function";

async function doSearch(
    vault: Vault,
    search: (text: string) => SearchResult | null
) {
    let files = vault.getMarkdownFiles();
    let results: SearchResultContext[] = [];
    for (let file of files) {
        let content = await vault.cachedRead(file);
        let fileResult = search(content);
        if (fileResult) {
            results.push(new SearchResultContext(file, content, fileResult));
        }
    }
    results.sort((a, b) => (a.score > b.score ? 1 : -1));
    return results;
}

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
                return await doSearch(val, search);
            },
        });
        t.list.field("simpleSearch", {
            objectName: "SearchResultContext",
            args: {
                query: "String",
            },
            async resolve(val, args) {
                let search = prepareSimpleSearch(args.query);
                return await doSearch(val, search);
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
        t.nonNull.field("createFolder", {
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
                    throw error;
                }
            },
        });
    },
});
