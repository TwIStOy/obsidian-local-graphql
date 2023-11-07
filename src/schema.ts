import { makeSchema } from "nexus";
import { AllSchemas } from "./graphql/types/types";

export const schema = makeSchema({
    types: AllSchemas,
});
