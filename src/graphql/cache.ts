import {
    CacheItem,
    Loc,
    Pos,
    Reference,
    ReferenceCache,
    LinkCache,
    EmbedCache,
    TagCache,
    HeadingCache,
    SectionCache,
    ListItemCache,
    FrontMatterCache,
    FrontmatterLinkCache,
    BlockCache,
} from "obsidian";

import { obInterfaceType, obObjectType } from "./util";

export const LocSchema = obObjectType<Loc>()({
    name: "Loc",
    definition(t) {
        t.int("line");
        t.int("col");
        t.int("offset");
    },
});

export const PosSchema = obObjectType<Pos>()({
    name: "Pos",
    definition(t) {
        t.field("start", "Loc");
        t.field("end", "Loc");
    },
});

export const CacheItemSchema = obInterfaceType<CacheItem>()({
    name: "CacheItem",
    definition(t) {
        t.field("position", "pos");
    },
});

export const ReferenceSchema = obInterfaceType<Reference>()({
    name: "Reference",
    definition(t) {
        t.string("link");
        t.string("original");
        t.string("displayText", {
            nullable: true,
        });
    },
});

export const ReferenceCacheSchema = obInterfaceType<ReferenceCache>()({
    name: "ReferenceCache",
    definition(t) {
        t.implements("CacheItem");
        t.implements("Reference");
    },
});

export const LinkCacheSchema = obObjectType<LinkCache>()({
    name: "LinkCache",
    definition(t) {
        t.implements("ReferenceCache");
    },
});

export const EmbedCacheSchema = obObjectType<EmbedCache>()({
    name: "EmbedCache",
    definition(t) {
        t.implements("ReferenceCache");
    },
});

export const TagCacheSchema = obObjectType<TagCache>()({
    name: "TagCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("tag");
    },
});

export const HeadingCacheSchema = obObjectType<HeadingCache>()({
    name: "HeadingCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("heading");
        t.int("level");
    },
});

export const SectionCacheSchema = obObjectType<SectionCache>()({
    name: "SectionCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("id", true);
        t.string("type");
    },
});

export const ListItemCacheSchema = obObjectType<ListItemCache>()({
    name: "ListItemCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("id", true);
        t.string("task", true);
        t.int("parent");
    },
});
