import { SearchMatchPart, SearchResult, TFile } from "obsidian";
import { interfaceType, objectType } from "../wrapper/block";

export const SearchMatchPartSchema = objectType<SearchMatchPart>()({
    name: "SearchMatchPart",
    definition(t) {
        t.int("from", {
            resolve(val) {
                return val[0];
            },
        });
        t.int("to", {
            resolve(val) {
                return val[1];
            },
        });
    },
});

export const SearchResultSchema = interfaceType<SearchResult>()({
    name: "SearchResult",
    definition(t) {
        t.int("score");
        t.list.field("matches", {
            objectName: "SearchMatchPart",
        });
    },
});

export interface SearchResultContext extends SearchResult {
    file: TFile;
}

export const SearchResultContextSchema = objectType<SearchResultContext>()({
    name: "SearchResultContext",
    definition(t) {
        t.implements("SearchResult");
        t.field("file", {
            objectName: "TFile",
        });
    },
});
