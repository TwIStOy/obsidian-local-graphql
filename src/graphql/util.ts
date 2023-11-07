import { objectType, interfaceType } from "nexus";
import {
    NexusObjectTypeDef,
    NexusInterfaceTypeDef,
    ObjectDefinitionBlock,
    OutputDefinitionBlock,
    InterfaceDefinitionBlock,
    isArray,
    isObject,
} from "nexus/dist/core";

import { anyGraphQLObject, GraphQLObject } from "./base";

type OutputBlockType = Omit<OutputDefinitionBlock<any>, "nonNull" | "nullable">;

type ResolveFunction<T> = (val: T, args: any, ctx: any, info: any) => any;

interface OptionalResolveFunction<
    T,
    FieldName extends Extract<keyof T, string>
> {
    resolve?: ResolveFunction<T>;
}

type NotIn<FieldName, T> = FieldName extends Extract<keyof T, string>
    ? never
    : FieldName;

interface RequiredResolveFunction<T, FieldName, _ = NotIn<FieldName, T>> {
    resolve: ResolveFunction<T>;
}

type ResolveFunctionOpt<T, FieldName> = FieldName extends Extract<
    keyof T,
    string
>
    ? OptionalResolveFunction<T, FieldName>
    : RequiredResolveFunction<T, FieldName>;

type ObOutputDefinitionBlockFieldConf<T, FieldName extends string> = {
    nullable?: boolean;
    args?: Record<string, string>;
    raw?: boolean;
    description?: string;
} & ResolveFunctionOpt<T, FieldName>;

type ObOutputDefinitionBlockFieldDef<
    T,
    FieldName extends string
> = FieldName extends Extract<keyof T, string>
    ? [(ObOutputDefinitionBlockFieldConf<T, FieldName> | undefined)?]
    : [ObOutputDefinitionBlockFieldConf<T, FieldName>];

export class ObOutputDefinitionBlock<T, TypeName extends string> {
    constructor(public t: OutputDefinitionBlock<any>) {}

    private _getBlock(opts?: { nullable?: boolean }): OutputBlockType {
        if (opts && opts.nullable) {
            return this.t.nullable;
        }
        return this.t;
    }

    private _isField(key: string, obj: T): key is Extract<keyof T, string> {
        return key in obj;
    }

    private _getResolve<FieldName extends string>(
        name: FieldName,
        opts?: ObOutputDefinitionBlockFieldConf<T, FieldName>,
        extra?: {
            type: string;
        }
    ) {
        return (ob: GraphQLObject<T>, args: any, ctx: any, info: any) => {
            let userResolve = opts?.resolve;

            let ret: any;

            if (userResolve) {
                ret = userResolve(ob._ob, args, ctx, info);
            } else if (this._isField(name, ob._ob)) {
                if (extra && !opts?.raw) {
                    ret = anyGraphQLObject(ob._ob[name], extra.type);
                } else {
                    ret = ob._ob[name];
                }
            } else {
                if (opts?.nullable) {
                    return null;
                }
                throw new Error(
                    `opts and resolve cannot be null if the field ${name} is not in the object ${ob}.`
                );
            }

            if (opts?.raw) {
                return ret;
            }
            // already converted
            if (isObject(ret) && "_objectName" in ret) {
                return ret;
            }
            if (extra) {
                if (isArray(ret)) {
                    return ret.map((item) => {
                        return anyGraphQLObject(item, extra.type);
                    });
                }
                return anyGraphQLObject(ret, extra.type);
            }
            return ret;
        };
    }

    public int<FieldName extends string>(
        field: FieldName,
        ...opts: ObOutputDefinitionBlockFieldDef<T, FieldName>
    ) {
        let resolve = this._getResolve(field, opts[0]);
        let t = this._getBlock(opts[0]);
        return t.int(field, {
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }

    public string<FieldName extends string>(
        field: FieldName,
        ...opts: ObOutputDefinitionBlockFieldDef<T, FieldName>
    ) {
        let resolve = this._getResolve(field, opts[0]);
        let t = this._getBlock(opts[0]);
        return t.string(field, {
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }

    public boolean<FieldName extends string>(
        field: FieldName,
        ...opts: ObOutputDefinitionBlockFieldDef<T, FieldName>
    ) {
        let resolve = this._getResolve(field, opts[0]);
        let t = this._getBlock(opts[0]);
        return t.boolean(field, {
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }

    public list(opts?: { nullable?: boolean }) {
        let t = this._getBlock(opts);
        return new ObOutputDefinitionBlock<T, TypeName>(t.list);
    }

    public field<FieldName extends string>(
        field: FieldName,
        type: string,
        ...opts: ObOutputDefinitionBlockFieldDef<T, FieldName>
    ) {
        let resolve = this._getResolve(field, opts[0], {
            type,
        });
        let t = this._getBlock(opts[0]);
        return t.field(field, {
            type: type,
            args: opts[0]?.args,
            description: opts[0]?.description,
            resolve: resolve,
        });
    }
}

export class ObObjectDefinitionBlock<
    T,
    TypeName extends string
> extends ObOutputDefinitionBlock<T, TypeName> {
    constructor(public t: ObjectDefinitionBlock<any>) {
        super(t);
    }

    public implements<InterfaceName extends string>(
        interfaceName: InterfaceName
    ) {
        return this.t.implements(interfaceName);
    }
}

export class ObInterfaceDefinitionBlock<
    T,
    TypeName extends string
> extends ObOutputDefinitionBlock<T, TypeName> {
    constructor(public t: InterfaceDefinitionBlock<any>) {
        super(t);
    }

    public implements<InterfaceName extends string>(
        interfaceName: InterfaceName
    ) {
        return this.t.implements(interfaceName);
    }
}

export type ObObjectConfig<T, TypeName extends string> = {
    name: TypeName;
    definition(t: ObObjectDefinitionBlock<T, TypeName>): void;
};

export type ObInterfaceConfig<T, TypeName extends string> = {
    name: TypeName;
    definition(t: ObInterfaceDefinitionBlock<T, TypeName>): void;
    resolveType?(ob: GraphQLObject<T>): string;
};

export function obObjectType<T>() {
    return function <TypeName extends string>(
        config: ObObjectConfig<T, TypeName>
    ) {
        return objectType<any>({
            name: config.name,
            definition(t) {
                let wrapper = new ObObjectDefinitionBlock<T, TypeName>(t);
                config.definition(wrapper);
            },
        }) as NexusObjectTypeDef<TypeName>;
    };
}

export function obInterfaceType<T>() {
    return function <TypeName extends string>(
        config: ObInterfaceConfig<T, TypeName>
    ) {
        return interfaceType<any>({
            name: config.name,
            definition(t) {
                let wrapper = new ObInterfaceDefinitionBlock<T, TypeName>(t);
                config.definition(wrapper);
            },
            resolveType(ob: GraphQLObject<T>) {
                if (config.resolveType) {
                    return config.resolveType(ob);
                }
                return ob._objectName;
            },
        }) as NexusInterfaceTypeDef<TypeName>;
    };
}
