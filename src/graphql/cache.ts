import { extendType, scalarType } from "nexus";
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
    FrontmatterLinkCache,
    BlockCache,
    CachedMetadata,
} from "obsidian";
import { Context } from "../context";
import { anyGraphQLObject } from "./base";

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
        t.field("position", "Pos");
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
        t.string("id", {
            nullable: true,
        });
        t.string("type");
    },
});

export const ListItemCacheSchema = obObjectType<ListItemCache>()({
    name: "ListItemCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("id", {
            nullable: true,
        });
        t.string("task", {
            nullable: true,
        });
        t.int("parent");
    },
});

export const FrontMatterItemValueSchema = scalarType({
    name: "FrontMatterItemValue",
    serialize(val) {
        return val;
    },
});

export const FrontMatterCacheItemSchema = obObjectType<{
    key: string;
    value: string;
}>()({
    name: "FrontMatterCacheItem",
    definition(t) {
        t.string("key");
        t.field("value", "FrontMatterItemValue", {
            raw: true,
        });
    },
});

export const FrontmatterLinkCacheSchema = obObjectType<FrontmatterLinkCache>()({
    name: "FrontmatterLinkCache",
    definition(t) {
        t.implements("Reference");
        t.string("key");
    },
});

export const BlockCacheSchema = obObjectType<BlockCache>()({
    name: "BlockCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("id");
    },
});

export const BlocksRecordItemSchema = obObjectType<{
    key: string;
    value: BlockCache;
}>()({
    name: "BlocksRecordItem",
    definition(t) {
        t.string("key");
        t.field("value", "BlockCache");
    },
});

export const ResolvedLinkItemSchema = obObjectType<any>()({
    name: "ResolvedLinkItem",
    definition(t) {
        t.string("from");
        t.string("to");
        t.int("count");
    },
});

export const CachedMetadataSchema = obObjectType<CachedMetadata>()({
    name: "CachedMetadata",
    definition(t) {
        t.list({ nullable: true }).field("links", "LinkCache", {
            resolve(val) {
                return val.links;
            },
        });
        t.list({ nullable: true }).field("embeds", "EmbedCache", {
            resolve(val) {
                return val.embeds;
            },
        });
        t.list({ nullable: true }).field("tags", "TagCache", {
            resolve(val) {
                return val.tags;
            },
        });
        t.list({ nullable: true }).field("headings", "HeadingCache", {
            resolve(val) {
                return val.headings;
            },
        });
        t.list({ nullable: true }).field("sections", "SectionCache", {
            description:
                "Sections are root level markdown blocks, which can be used to divide the document up.",
            resolve(val) {
                return val.sections;
            },
        });
        t.list({ nullable: true }).field("listItems", "ListItemCache", {
            resolve(val) {
                return val.listItems;
            },
        });
        t.list({
            nullable: true,
        }).field("frontmatter", "FrontMatterCacheItem", {
            resolve(val) {
                if (!val.frontmatter) {
                    return null;
                }
                let ret = [];
                for (let key in val.frontmatter) {
                    ret.push({
                        key: key,
                        value: val.frontmatter[key],
                    });
                }
                return ret;
            },
        });
        t.field("frontmatterPosition", "Pos");
        t.list({ nullable: true }).field(
            "frontmatterLinks",
            "FrontmatterLinkCache",
            {
                resolve(val) {
                    return val.frontmatterLinks;
                },
            }
        );
        t.list({ nullable: true }).field("blocks", "BlocksRecordItem", {
            resolve(val) {
                if (!val.blocks) {
                    return null;
                }
                let ret = [];
                for (let key in val.blocks) {
                    ret.push({
                        key: key,
                        value: val.blocks[key],
                    });
                }
                return ret;
            },
        });
    },
});

export const MetadataCacheQuery = extendType({
    type: "Query",
    definition(t) {
        t.nullable.field("getCache", {
            type: "CachedMetadata",
            args: {
                filePath: "String",
            },
            resolve(_root, args, ctx: Context) {
                return anyGraphQLObject(
                    ctx.app.metadataCache.getCache(args.filePath),
                    "CachedMetadata"
                );
            },
        });
        t.list.field("resolvedLinks", {
            type: "ResolvedLinkItem",
            resolve(_root, _args, ctx: Context) {
                let links = ctx.app.metadataCache.resolvedLinks;
                let ret = [];
                for (let from in links) {
                    for (let to in links[from]) {
                        ret.push(
                            anyGraphQLObject(
                                {
                                    from: from,
                                    to: to,
                                    count: links[from][to],
                                },
                                "ResolvedLinkItem"
                            )
                        );
                    }
                }
                return ret;
            },
        });
        t.list.field("unresolvedLinks", {
            type: "ResolvedLinkItem",
            resolve(_root, _args, ctx: Context) {
                let links = ctx.app.metadataCache.unresolvedLinks;
                let ret = [];
                for (let from in links) {
                    for (let to in links[from]) {
                        ret.push(
                            anyGraphQLObject(
                                {
                                    from: from,
                                    to: to,
                                    count: links[from][to],
                                },
                                "ResolvedLinkItem"
                            )
                        );
                    }
                }
                return ret;
            },
        });
    },
});
