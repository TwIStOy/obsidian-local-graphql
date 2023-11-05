import { makeSchema } from "nexus";

import {
	FileStatsObject,
	TAbstractFileObject,
	TFileObject,
	TFolderObject,
} from "./graphql/file";
import { VaultObject, VaultQuery } from "./graphql/vault";

export const schema = makeSchema({
	types: [
		// objects
		VaultObject.schema,
		TFolderObject.schema,
		TFileObject.schema,
		TAbstractFileObject.schema,
		FileStatsObject.schema,
		// queries
		VaultQuery,
	],
});
