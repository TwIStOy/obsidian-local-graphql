import { makeSchema } from "nexus";

import {
    FileStatsObject,
    TAbstractFileObject,
    TFileObject,
    TFolderObject,
} from "./graphql/file";
import { VaultObject, VaultQuery } from "./graphql/vault";
import {
    ReferenceCacheObject,
    ReferenceObject,
    CacheItemObject,
    PosObject,
    LocObject,
} from "./graphql/cache";

export const schema = makeSchema({
    types: [
        // objects
        VaultObject.schema,
        TFolderObject.schema,
        TFileObject.schema,
        TAbstractFileObject.schema,
        FileStatsObject.schema,
        ReferenceCacheObject.schema,
        ReferenceObject.schema,
        CacheItemObject.schema,
        PosObject.schema,
        LocObject.schema,
        // queries
        VaultQuery,
    ],
});
