import { makeSchema } from "nexus";

import {
    TAbstractFileSchema,
    TFolderSchema,
    TFileSchema,
    FileStatsSchema,
} from "./graphql/file";
import { VaultSchema, VaultQuery } from "./graphql/vault";
import {
    LocSchema,
    PosSchema,
    CacheItemSchema,
    ReferenceSchema,
    ReferenceCacheSchema,
    LinkCacheSchema,
    EmbedCacheSchema,
    HeadingCacheSchema,
    SectionCacheSchema,
    ListItemCacheSchema,
    CachedMetadataSchema,
    TagCacheSchema,
    FrontMatterCacheItemSchema,
    FrontMatterItemValueSchema,
    FrontmatterLinkCacheSchema,
    BlockCacheSchema,
    BlocksRecordItemSchema,
    MetadataCacheQuery,
    ResolvedLinkItemSchema,
} from "./graphql/cache";

export const schema = makeSchema({
    types: [
        // objects
        TAbstractFileSchema,
        TFolderSchema,
        TFileSchema,
        FileStatsSchema,
        LocSchema,
        PosSchema,
        CacheItemSchema,
        ReferenceSchema,
        ReferenceCacheSchema,
        LinkCacheSchema,
        EmbedCacheSchema,
        HeadingCacheSchema,
        TagCacheSchema,
        SectionCacheSchema,
        ListItemCacheSchema,
        CachedMetadataSchema,
        FrontMatterCacheItemSchema,
        FrontMatterItemValueSchema,
        FrontmatterLinkCacheSchema,
        BlockCacheSchema,
        BlocksRecordItemSchema,
		ResolvedLinkItemSchema,
        VaultSchema,
        // queries
        VaultQuery,
        MetadataCacheQuery,
    ],
});
