import {
    InterfaceDefinitionBlock,
    isArray,
    MaybePromise,
    NexusInterfaceTypeDef,
    NexusObjectTypeDef,
    ObjectDefinitionBlock,
    OutputDefinitionBlock,
} from "nexus/dist/core";
import { Context } from "../../context";
import { GraphQLObject } from "../base";
import {
    objectType as rawObjectType,
    interfaceType as rawInterfaceType,
} from "nexus";

export type ResolveFunction<T> = (
    val: T,
    args: any,
    ctx: Context,
    info: any,
    gobj: GraphQLObject<T>
) => MaybePromise<any>;

type NotIn<FieldName, T> = FieldName extends Extract<keyof T, string>
    ? never
    : FieldName;

type NeedsResolveFunction<T, FieldName> = FieldName extends Extract<
    keyof T,
    string
>
    ? false
    : true;

type ResolveFunctionRequired<T, FieldName, _ = NotIn<FieldName, T>> = {
    resolve: ResolveFunction<T>;
};

type ResolveFunctionOptional<T, FieldName, _ = FieldName> = {
    resolve?: ResolveFunction<T>;
};

type ResolveFunctionOpt<T, FieldName> = NeedsResolveFunction<
    T,
    FieldName
> extends true
    ? ResolveFunctionRequired<T, FieldName>
    : ResolveFunctionOptional<T, FieldName>;

type GenerateResolveFunctionOpts<T, FieldName extends string> = {
    raw?: boolean;
    nullable?: boolean;
} & ResolveFunctionOpt<T, FieldName>;

function isField<T>(key: string, obj: T): key is Extract<keyof T, string> {
    return key in obj;
}

type CommonOutputDefinitionBlockFieldOpts = {
    args?: Record<string, string>;
    description?: string;
};

type OutputDefinitionBlockWrapperScalarFieldOpts<
    T,
    FieldName extends string,
> = GenerateResolveFunctionOpts<T, FieldName> &
    CommonOutputDefinitionBlockFieldOpts;

type OutputDefinitionBlockWrapperScalarFieldArgs<
    T,
    FieldName extends string,
> = FieldName extends Extract<keyof T, string>
    ? [(OutputDefinitionBlockWrapperScalarFieldOpts<T, FieldName> | undefined)?]
    : [OutputDefinitionBlockWrapperScalarFieldOpts<T, FieldName>];

type OutputDefinitionBlockWrapperNotScalarFieldOpts<
    T,
    FieldName extends string,
> = GenerateResolveFunctionOpts<T, FieldName> &
    CommonOutputDefinitionBlockFieldOpts & {
        objectName: string;
    };

export class OutputDefinitionBlockWrapper<T, TypeName extends string> {
    constructor(public t: OutputDefinitionBlock<any>) {}

    private _resolveBlock(opts?: {
        nullable?: boolean;
    }): Omit<OutputDefinitionBlock<any>, "nonNull" | "nullable"> {
        if (opts && opts.nullable) {
            return this.t.nullable;
        }
        return this.t;
    }

    private _generateResolveFunction<FieldName extends string>(
        fieldName: FieldName,
        objectType:
            | {
                  objectName: string;
              }
            | "scalar",
        opts: GenerateResolveFunctionOpts<T, FieldName>
    ) {
        let resolver: ResolveFunction<T>;
        if (opts.resolve) {
            resolver = opts.resolve;
        } else {
            resolver = this._generateDefaultResolveFunction(fieldName, opts);
        }
        return async (
            gobj: GraphQLObject<T>,
            args: any,
            ctx: any,
            info: any
        ) => {
            let ret = await Promise.resolve(
                resolver(gobj.ob, args, ctx, info, gobj)
            );
            if (ret === null || ret === undefined) {
                if (opts.nullable) {
                    return null;
                }
                throw new Error(
                    `Field ${fieldName} returned null or undefined, but it is not nullable.`
                );
            }
            if (objectType == "scalar") {
                return ret;
            }
            return this._normalizeGraphQLObject(ret, {
                raw: opts.raw ?? false,
                objectName: objectType.objectName,
                parent: gobj,
            });
        };
    }

    private _generateDefaultResolveFunction<FieldName extends string>(
        fieldName: FieldName,
        opts: GenerateResolveFunctionOpts<T, FieldName>
    ): ResolveFunction<T> {
        return (val: T, _args: any, _ctx: Context, _info: any) => {
            if (isField(fieldName, val)) {
                return val[fieldName];
            }
            if (opts.nullable) {
                return null;
            }
            throw new Error(
                `Field ${fieldName} not found in ${val}, a resolver must be provided.`
            );
        };
    }

    private _normalizeGraphQLObject(
        obj: any,
        opts: {
            raw: boolean; // keep the original object
            objectName: string; // set the typename
            parent: GraphQLObject<any>;
        }
    ): any {
        if (opts?.raw) {
            return obj;
        }
        if (obj instanceof GraphQLObject) {
            if (obj.objectName !== opts.objectName) {
                throw new Error(
                    `Object name mismatch: ${obj.objectName} != ${opts.objectName}`
                );
            }
            // is GraphQLObject already
            return obj;
        }
        // check if it is an array
        if (isArray(obj)) {
            return obj.map((item) => {
                return this._normalizeGraphQLObject(item, opts);
            });
        }
        return new GraphQLObject(obj, opts.objectName, opts.parent);
    }

    private _normalizeOpts<FieldName extends string>(
        ...opts: OutputDefinitionBlockWrapperScalarFieldArgs<T, FieldName>
    ): GenerateResolveFunctionOpts<T, FieldName> {
        return {
            raw: opts[0]?.raw ?? false,
            nullable: opts[0]?.nullable ?? false,
            resolve: opts[0]?.resolve as any,
        };
    }

    public int<FieldName extends string>(
        field: FieldName,
        ...opts: OutputDefinitionBlockWrapperScalarFieldArgs<T, FieldName>
    ) {
        let resolve = this._generateResolveFunction(
            field,
            "scalar",
            this._normalizeOpts(...opts)
        );
        let t = this._resolveBlock(opts[0]);
        return t.int(field, {
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }

    public float<FieldName extends string>(
        field: FieldName,
        ...opts: OutputDefinitionBlockWrapperScalarFieldArgs<T, FieldName>
    ) {
        let resolve = this._generateResolveFunction(
            field,
            "scalar",
            this._normalizeOpts(...opts)
        );
        let t = this._resolveBlock(opts[0]);
        return t.float(field, {
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }

    public string<FieldName extends string>(
        field: FieldName,
        ...opts: OutputDefinitionBlockWrapperScalarFieldArgs<T, FieldName>
    ) {
        let resolve = this._generateResolveFunction(
            field,
            "scalar",
            this._normalizeOpts(...opts)
        );
        let t = this._resolveBlock(opts[0]);
        return t.string(field, {
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }

    public boolean<FieldName extends string>(
        field: FieldName,
        ...opts: OutputDefinitionBlockWrapperScalarFieldArgs<T, FieldName>
    ) {
        let resolve = this._generateResolveFunction(
            field,
            "scalar",
            this._normalizeOpts(...opts)
        );
        let t = this._resolveBlock(opts[0]);
        return t.boolean(field, {
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }

    public get list() {
        return new OutputDefinitionBlockWrapper<T, TypeName>(this.t.list);
    }

    public field<FieldName extends string>(
        field: FieldName,
        opts: OutputDefinitionBlockWrapperNotScalarFieldOpts<T, FieldName>
    ) {
        let resolve = this._generateResolveFunction(field, opts, opts);
        let t = this._resolveBlock(opts);
        return t.field(field, {
            type: opts.objectName,
            args: opts.args,
            description: opts.description,
            resolve: resolve,
        });
    }
}

export class ObjectDefinitionBlockWrapper<
    T,
    TypeName extends string,
> extends OutputDefinitionBlockWrapper<T, TypeName> {
    constructor(public t: ObjectDefinitionBlock<any>) {
        super(t);
    }

    public implements<InterfaceName extends string>(
        interfaceName: InterfaceName
    ) {
        return this.t.implements(interfaceName);
    }
}

export class InterfaceDefinitionBlockWrapper<
    T,
    TypeName extends string,
> extends OutputDefinitionBlockWrapper<T, TypeName> {
    constructor(public t: InterfaceDefinitionBlock<any>) {
        super(t);
    }

    public implements<InterfaceName extends string>(
        interfaceName: InterfaceName
    ) {
        return this.t.implements(interfaceName);
    }
}

export function objectType<T>() {
    return function <TypeName extends string>(config: {
        name: TypeName;
        definition(t: ObjectDefinitionBlockWrapper<T, TypeName>): void;
    }) {
        return rawObjectType<any>({
            name: config.name,
            definition(t) {
                let wrapper = new ObjectDefinitionBlockWrapper<T, TypeName>(t);
                config.definition(wrapper);
            },
        }) as NexusObjectTypeDef<TypeName>;
    };
}

export function interfaceType<T>() {
    return function <TypeName extends string>(config: {
        name: TypeName;
        definition(t: InterfaceDefinitionBlockWrapper<T, TypeName>): void;
        resolveType?(ob: GraphQLObject<T>): string;
    }) {
        return rawInterfaceType<any>({
            name: config.name,
            definition(t) {
                let wrapper = new InterfaceDefinitionBlockWrapper<T, TypeName>(
                    t
                );
                config.definition(wrapper);
            },
            resolveType(ob: GraphQLObject<T>) {
                if (config.resolveType) {
                    return config.resolveType(ob);
                }
                return ob.objectName;
            },
        }) as NexusInterfaceTypeDef<TypeName>;
    };
}
