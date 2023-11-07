import { CacheItem } from "obsidian";
import { interfaceType } from "../wrapper/block";

export const CacheItemSchema = interfaceType<CacheItem>()({
    name: "CacheItem",
    definition(t) {
        t.field("position", {
            objectName: "Pos",
        });
    },
});
