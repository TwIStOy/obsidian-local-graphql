import { extendType } from "nexus";
import {
    BlockCache,
    CachedMetadata,
    EmbedCache,
    FrontmatterLinkCache,
    HeadingCache,
    LinkCache,
    ListItemCache,
    MetadataCache,
    ReferenceCache,
    SectionCache,
    TagCache,
} from "obsidian";
import { Context } from "../../context";
import { GraphQLObject } from "../base";
import { interfaceType, objectType } from "../wrapper/block";

export const ReferenceCacheSchema = interfaceType<ReferenceCache>()({
    name: "ReferenceCache",
    definition(t) {
        t.implements("CacheItem");
        t.implements("Reference");
    },
});

export const LinkCacheSchema = objectType<LinkCache>()({
    name: "LinkCache",
    definition(t) {
        t.implements("ReferenceCache");
    },
});

export const EmbedCacheSchema = objectType<EmbedCache>()({
    name: "EmbedCache",
    definition(t) {
        t.implements("ReferenceCache");
    },
});

export const TagCacheSchema = objectType<TagCache>()({
    name: "TagCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("tag");
    },
});

export const HeadingCacheSchema = objectType<HeadingCache>()({
    name: "HeadingCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("heading");
        t.int("level");
    },
});

export const SectionCacheSchema = objectType<SectionCache>()({
    name: "SectionCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("id", {
            nullable: true,
        });
        t.string("type");
    },
});

export const ListItemCacheSchema = objectType<ListItemCache>()({
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

export const FrontMatterCacheItemSchema = objectType<{
    key: string;
    value: any;
}>()({
    name: "FrontMatterCacheItem",
    definition(t) {
        t.string("key");
        t.field("value", {
            objectName: "RawObject",
            raw: true,
        });
    },
});

export const FrontmatterLinkCacheSchema = objectType<FrontmatterLinkCache>()({
    name: "FrontmatterLinkCache",
    definition(t) {
        t.implements("Reference");
        t.string("key");
    },
});

export const BlockCacheSchema = objectType<BlockCache>()({
    name: "BlockCache",
    definition(t) {
        t.implements("CacheItem");
        t.string("id");
    },
});

export const BlocksRecordItemSchema = objectType<{
    key: string;
    value: BlockCache;
}>()({
    name: "BlocksRecordItem",
    definition(t) {
        t.string("key");
        t.field("value", {
            objectName: "BlockCache",
        });
    },
});

export const ResolvedLinkItemSchema = objectType<{
    from: string;
    to: string;
    count: number;
}>()({
    name: "ResolvedLinkItem",
    definition(t) {
        t.string("from");
        t.string("to");
        t.int("count");
    },
});

export const CachedMetadataSchema = objectType<CachedMetadata>()({
    name: "CachedMetadata",
    definition(t) {
        t.list.field("links", {
            objectName: "LinkCache",
            resolve(val, _args, _ctx: Context, _info) {
                return val.links ?? [];
            },
        });
        t.list.field("embeds", {
            objectName: "EmbedCache",
            resolve(val) {
                return val.embeds ?? [];
            },
        });
        t.list.field("tags", {
            objectName: "TagCache",
            resolve(val) {
                return val.tags ?? [];
            },
        });
        t.list.field("headings", {
            objectName: "HeadingCache",
            resolve(val) {
                return val.headings ?? [];
            },
        });
        t.list.field("sections", {
            objectName: "SectionCache",
            description:
                "Sections are root level markdown blocks, which can be used to divide the document up.",
            resolve(val) {
                return val.sections ?? [];
            },
        });
        t.list.field("listItems", {
            objectName: "ListItemCache",
            resolve(val) {
                return val.listItems ?? [];
            },
        });
        t.list.field("frontmatter", {
            objectName: "FrontMatterCacheItem",
            resolve(val) {
                if (!val.frontmatter) {
                    return [];
                }
                let ret: {
                    key: string;
                    value: any;
                }[] = [];
                for (let key in val.frontmatter) {
                    ret.push({
                        key: key,
                        value: val.frontmatter[key],
                    });
                }
                return ret;
            },
        });
        t.field("frontmatterPosition", {
            objectName: "Pos",
        });
        t.list.field("frontmatterLinks", {
            objectName: "FrontmatterLinkCache",
            resolve(val) {
                return val.frontmatterLinks ?? [];
            },
        });
        t.list.field("blocks", {
            objectName: "BlocksRecordItem",
            resolve(val) {
                if (!val.blocks) {
                    return [];
                }
                let ret: {
                    key: string;
                    value: BlockCache;
                }[] = [];
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

export const MetadataCacheSchema = objectType<MetadataCache>()({
    name: "MetadataCache",
    definition(t) {
        t.field("getCache", {
            nullable: true,
            objectName: "CachedMetadata",
            args: {
                filePath: "String",
            },
            resolve(val, args) {
                return val.getCache(args.filePath);
            },
        });
        t.list.field("resolvedLinks", {
            objectName: "ResolvedLinkItem",
            resolve(val) {
                let links = val.resolvedLinks;
                let ret: {
                    from: string;
                    to: string;
                    count: number;
                }[] = [];
                for (let from in links) {
                    for (let to in links[from]) {
                        ret.push({
                            from: from,
                            to: to,
                            count: links[from][to],
                        });
                    }
                }
                return ret;
            },
        });
        t.list.field("unresolvedLinks", {
            objectName: "ResolvedLinkItem",
            resolve(val) {
                let links = val.resolvedLinks;
                let ret: {
                    from: string;
                    to: string;
                    count: number;
                }[] = [];
                for (let from in links) {
                    for (let to in links[from]) {
                        ret.push({
                            from: from,
                            to: to,
                            count: links[from][to],
                        });
                    }
                }
                return ret;
            },
        });
    },
});

export const MetadataCacheQuery = extendType({
    type: "Query",
    definition(t) {
        t.field("metadataCache", {
            type: "MetadataCache",
            resolve(_root, _args, ctx: Context) {
                return new GraphQLObject(
                    ctx.app.metadataCache,
                    "MetadataCache"
                );
            },
        });
    },
});
