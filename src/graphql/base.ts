/**
 * A GraphQL object that represents an Obsidian object.
 */
export interface GraphQLObject<T> {
    /**
     * The Obsidian object that this GraphQL object represents.
     */
    _ob: T;
    /**
     * The name of this GraphQL object.
     */
    readonly _objectName: string;
}

export function anyGraphQLObject(
    ob: any,
    objectName: string
): GraphQLObject<any> | null {
    if (ob == null) {
        return null;
    }
    return {
        _ob: ob,
        _objectName: objectName,
    };
}
