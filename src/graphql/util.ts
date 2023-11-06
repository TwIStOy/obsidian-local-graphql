import { objectType, interfaceType } from "nexus";
import {
    NexusObjectTypeDef,
    NexusInterfaceTypeDef,
    ObjectDefinitionBlock,
    OutputDefinitionBlock,
    InterfaceDefinitionBlock,
} from "nexus/dist/core";

import { anyGraphQLObject, GraphQLObject } from "./base";

export type ObOutputDefinitionBlockFieldDef<T, R> = {
    nullable?: boolean;
    resolve?: (ob: GraphQLObject<T>) => R;
};

type OutputBlockType = Omit<OutputDefinitionBlock<any>, "nonNull" | "nullable">;

export class ObOutputDefinitionBlock<T, TypeName extends string> {
    constructor(public t: OutputDefinitionBlock<any>) {}

    _getBlock(opts?: { nullable?: boolean }): OutputBlockType {
        if (opts && opts.nullable) {
            return this.t.nullable;
        }
        return this.t;
    }

    public int<FieldName extends Extract<keyof T, string>>(
        field: FieldName,
        opts?: ObOutputDefinitionBlockFieldDef<T, number>
    ) {
        let resolve = opts
            ? opts.resolve
            : (ob: GraphQLObject<T>) => {
                  return ob._ob[field];
              };
        let t = this._getBlock(opts);
        return t.int(field, { resolve: resolve });
    }

    public string<FieldName extends Extract<keyof T, string>>(
        field: FieldName,
        opts?: ObOutputDefinitionBlockFieldDef<T, string>
    ) {
        let resolve = opts
            ? opts.resolve
            : (ob: GraphQLObject<T>) => {
                  return ob._ob[field];
              };
        let t = this._getBlock(opts);
        return t.string(field, { resolve: resolve });
    }

    public field<FieldName extends Extract<keyof T, string>>(
        field: FieldName,
        type: string,
        opts?: ObOutputDefinitionBlockFieldDef<T, any>
    ) {
        let resolve = opts
            ? opts.resolve
            : (ob: GraphQLObject<T>): GraphQLObject<any> | null => {
                  return anyGraphQLObject(ob._ob[field], type);
              };
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
