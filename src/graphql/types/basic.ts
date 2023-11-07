import { scalarType } from "nexus";
import { Loc, Pos, Reference, TFile } from "obsidian";
import { GraphQLObject } from "../base";
import { interfaceType, objectType } from "../wrapper/block";

export const LocSchema = objectType<Loc>()({
    name: "Loc",
    definition(t) {
        t.int("line");
        t.int("col");
        t.int("offset");
    },
});

export const PosSchema = objectType<Pos>()({
    name: "Pos",
    definition(t) {
        t.field("start", {
            objectName: "Loc",
        });
        t.field("end", {
            objectName: "Loc",
        });
    },
});

export const ReferenceSchema = interfaceType<Reference>()({
    name: "Reference",
    definition(t) {
        t.string("link");
        t.string("original");
        t.string("displayText", {
            nullable: true,
        });
        t.field("linkPath", {
            nullable: true,
            objectName: "TFile",
            resolve(val, _args, ctx, _info, gobj) {
                let file = gobj.findParent("TFile");
                if (!file) {
                    return null;
                }
                return ctx.app.metadataCache.getFirstLinkpathDest(
                    val.link,
                    (file as GraphQLObject<TFile>).ob.path
                );
            },
        });
    },
});

export const RawObjectSchema = scalarType({
    name: "RawObject",
    serialize(val) {
        return val;
    },
});
