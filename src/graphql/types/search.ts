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
