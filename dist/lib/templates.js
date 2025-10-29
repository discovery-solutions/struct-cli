export const idxTemplate = (entityPascal, fieldsTs, zodCreate, zodUpdate) => `import { z } from "zod";

export interface ${entityPascal}Interface {
  _id?: string;
${fieldsTs}
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export const ${lc(entityPascal)}Schema = ${zodCreate};

export const ${lc(entityPascal)}UpdateSchema = ${zodUpdate};
`;
export const modelTemplate = (entityPascal, mongooseFields) => `import mongoose from "mongoose";
import { ${entityPascal}Interface } from "./";

const schema = new mongoose.Schema<${entityPascal}Interface>({
${mongooseFields}
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

schema.index({ deletedAt: 1 });

export const ${entityPascal} = mongoose.models.${entityPascal} || mongoose.model<${entityPascal}Interface>("${entityPascal}", schema);
`;
export const utilsTemplate = (entityPascal, columns, fields) => `"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { FieldInterface } from "@discovery-solutions/struct/client";
import { ${entityPascal}Interface } from "./";

export const ${lc(entityPascal)}Columns: ColumnDef<${entityPascal}Interface>[] = [
${columns}
];

export const ${lc(entityPascal)}Fields: FieldInterface[] = [
${fields}
];
`;
export const apiRouteTemplate = (plural, entityPascal) => `import { CRUDController } from "@/struct";
import { ${entityPascal}, ${entityPascal}Interface } from "@/models/${plural}/${lc(entityPascal)}/model";
import { ${lc(entityPascal)}Schema, ${lc(entityPascal)}UpdateSchema } from "@/models/${plural}/${lc(entityPascal)}";

export const { GET, POST, PATCH, DELETE } = new CRUDController<${entityPascal}Interface>(${entityPascal}, {
  softDelete: true,
  createSchema: ${lc(entityPascal)}Schema,
  updateSchema: ${lc(entityPascal)}UpdateSchema,
  roles: {
    GET: ["admin","user"],
    POST: "admin",
    PATCH: "admin",
    DELETE: "superadmin"
  }
});
`;
export const pageListTemplate = (plural, entityPascal) => `"use client";
import { TableView } from "@discovery-solutions/struct/client";
import { ${lc(entityPascal)}Columns } from "@/models/${plural}/${lc(entityPascal)}/utils";

export default function Page() {
  return <TableView endpoint="${plural}" columns={${lc(entityPascal)}Columns} />;
}
`;
export function lc(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
export function sc(s) { return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(); }
