import { FuseResult, FuseResultMatch } from "fuse.js";
import { SearchResult, TFile } from "obsidian";
import { objectType } from "../wrapper/block";

export interface SearchMatchPart {
    fromOffset: number;
    toOffset: number;
    text: string;
}

export const SearchMatchPartSchema = objectType<SearchMatchPart>()({
    name: "SearchMatchPart",
    definition(t) {
        t.int("fromOffset");
        t.int("toOffset");
        t.string("text");
    },
});

export class SearchResultContext {
    file: TFile;
    score: number;
    content: string;
    matches: SearchMatchPart[];

    constructor(file: TFile, content: string, result: SearchResult) {
        this.file = file;
        this.score = result.score;
        this.content = content;
        this.matches = result.matches.map((item) => {
            return {
                fromOffset: item[0],
                toOffset: item[1],
                text: content.substring(item[0], item[1]),
            };
        });
    }
}

export const SearchResultContextSchema = objectType<SearchResultContext>()({
    name: "SearchResultContext",
    definition(t) {
        t.field("file", {
            objectName: "TFile",
        });
        t.float("score");
        t.string("content");
        t.list.field("matches", {
            objectName: "SearchMatchPart",
        });
    },
});

export const FuseResultMatchSchema = objectType<FuseResultMatch>()({
	name: "FuseResultMatch",
	definition(t) {
		t.string("key", {
			nullable: true,
		});
		t.string("value", {
			nullable: true,
		});
		t.int("refIndex", {
			nullable: true,
		});
		t.field("indices", {
			objectName: "RawObject",
			raw: true,
		})
	},
});

export const SearchAliasResultItemSchema = objectType<{
	file: TFile,
	aliases: string[]
}>()({
	name: "SearchAliasResultItem",
	definition(t) {
		t.field("file", {
			objectName: "TFile",
		});
		t.list.string("aliases");
	},
});

export const FuseResultSchema = objectType<FuseResult<any>>()({
	name: "FuseResult",
	definition(t) {
		t.int("refIndex");
		t.float("score", {
			nullable: true,
		});
		t.list.field("matches", {
			nullable: true,
			objectName: "FuseResultMatch",
		});
		t.field("item", {
			objectName: "SearchAliasResultItem",
		});
	},
});

