import * as BasicSchemas from "./basic";
import * as CacheSchemas from "./cache";
import * as MetadataSchemas from "./metadata";
import * as FileSchemas from "./file";
import * as VaultSchemas from "./vault";
import * as SearchSchemas from "./search";

export const AllSchemas: any[] = [
    BasicSchemas,
    CacheSchemas,
    MetadataSchemas,
    FileSchemas,
    VaultSchemas,
	SearchSchemas,
]
    .map((x) => Object.values(x))
    .flat();
