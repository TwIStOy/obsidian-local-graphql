/**
 * A GraphQL object that represents an Obsidian object.
 */
export class GraphQLObject<T> {
    /**
     * The Obsidian object that this GraphQL object represents.
     */
    private _ob: T;
    /**
     * The name of this GraphQL object.
     */
    private readonly _objectName: string;

    /**
     * The parent in query tree.
     */
    private readonly _parent: GraphQLObject<any> | null;

    constructor(ob: T, objectName: string, parent?: GraphQLObject<any>) {
        this._ob = ob;
        this._objectName = objectName;
        for (let dispatcher of graphQLObjectObjectNames) {
            if (dispatcher.tester(ob)) {
                this._objectName = dispatcher.objectName;
                break;
            }
        }
        this._parent = parent ?? null;
    }

    /**
     * Get the Obsidian object that this GraphQL object represents.
     */
    public get ob(): T {
        return this._ob;
    }

    /**
     * Get the name of this GraphQL object.
     */
    public get objectName(): string {
        return this._objectName;
    }

    /**
     * Get the parent in query tree.
     */
    public get parent(): GraphQLObject<any> | null {
        return this._parent;
    }

    public findParent(objectName: string): GraphQLObject<any> | null {
        let parent = this.parent;
        while (parent != null) {
            if (parent.objectName == objectName) {
                return parent;
            }
            parent = parent.parent;
        }
        return null;
    }
}

export interface GraphQLObjectDispatcher {
    tester: (ob: any) => boolean;
    objectName: string;
}

var graphQLObjectObjectNames: GraphQLObjectDispatcher[] = [];

type Constructor<T> = new (...args: any[]) => T;

function ofType<T>(obj: any, type: Constructor<T>): obj is T {
    return obj instanceof type;
}

export function registerObject(objectName: string, type: Constructor<any>) {
    let tester = (obj: any) => {
        return ofType(obj, type);
    };
    graphQLObjectObjectNames.push({
        tester: tester,
        objectName: objectName,
    });
}
