import { objectType, interfaceType } from "nexus";
import {
    NexusObjectTypeDef,
    NexusInterfaceTypeDef,
    ObjectDefinitionBlock,
    OutputDefinitionBlock,
    InterfaceDefinitionBlock,
} from "nexus/dist/core";

import { anyGraphQLObject, GraphQLObject } from "./base";

type OutputBlockType = Omit<OutputDefinitionBlock<any>, "nonNull" | "nullable">;

// type ResolverConfig<T, FieldName extends string, R> = FieldName extends Extract<
//     keyof T,
//     string
// >
//     ? {
//           resolve?: ResolverType<T, R>;
//       }
//     : {
//           resolve: ResolverType<T, R>;
//       };


export interface ObOutputDefinitionBlockFieldDef {}

export type ObOutputDefinitionBlockFieldDef<T, FieldName extends string, R> = {
    nullable?: boolean;
} & ResolverConfig<T, FieldName, R>;

export class ObOutputDefinitionBlock<T, TypeName extends string> {
    constructor(public t: OutputDefinitionBlock<any>) {}

    _getBlock(opts?: { nullable?: boolean }): OutputBlockType {
        if (opts && opts.nullable) {
            return this.t.nullable;
        }
        return this.t;
    }

    _isField(key: string, obj: T): key is Extract<keyof T, string> {
        return key in obj;
    }

    _getResolve<FieldName extends string, R>(
        name: FieldName,
        opts?: ObOutputDefinitionBlockFieldDef<T, FieldName, R>,
        wrapResult: boolean = false
    ) {
        return (ob: GraphQLObject<T>) => {
            if (this._isField(name, ob._ob)) {
                if (opts && opts.resolve) {
                    return opts.resolve(ob);
                }
                if (wrapResult) {
                    return anyGraphQLObject(ob._ob[name], name);
                } else {
                    return ob._ob[name];
                }
            } else {
                if (!opts || !opts?.resolve) {
                    throw new Error(
                        `opts and resolve cannot be null if the field is not in the object.`
                    );
                }
                return opts && opts.resolve(ob);
            }
        };
    }

    public int<FieldName extends string>(
        field: FieldName,
        opts?: ObOutputDefinitionBlockFieldDef<T, FieldName, number>
    ) {
        let resolve = this._getResolve(field, opts);
        let t = this._getBlock(opts);
        return t.int(field, { resolve: resolve });
    }

    public string<FieldName extends Extract<keyof T, string>>(
        field: FieldName,
        opts?: ObOutputDefinitionBlockFieldDef<T, FieldName, string>
    ) {
        let resolve = this._getResolve(field, opts);
        let t = this._getBlock(opts);
        return t.string(field, { resolve: resolve });
    }

    public field<FieldName extends Extract<keyof T, string>>(
        field: FieldName,
        type: string,
        opts?: ObOutputDefinitionBlockFieldDef<T, FieldName, any>
    ) {
        let resolve = this._getResolve(field, opts, true);
        let t = this._getBlock(opts);
        return t.field(field, { type: type, resolve: resolve });
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
