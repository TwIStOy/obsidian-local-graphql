import * as BasicSchemas from "./basic";
import * as CacheSchemas from "./cache";
import * as MetadataSchemas from "./metadata";
import * as FileSchemas from "./file";
import * as VaultSchemas from "./vault";

export const AllSchemas: any[] = [
    BasicSchemas,
    CacheSchemas,
    MetadataSchemas,
    FileSchemas,
    VaultSchemas,
]
    .map((x) => Object.values(x))
    .flat();
