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
		SectionCacheSchema,
		ListItemCacheSchema,
		VaultSchema,
		// queries
		VaultQuery,
	],
});
