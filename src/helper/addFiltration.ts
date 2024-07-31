import { Request } from "express";
import { SelectQueryBuilder } from "kysely";
import {  TableName } from "../database";
import { DB } from "../database/GeneratedSchema";
import { addProductFilters } from "./addProductFilters";
import { addAddressFilters } from "./addAddressFilters";

export function addFiltration(
  table: TableName,
  query: SelectQueryBuilder<DB, TableName, any>,
  req: Request,
) {

  if (table === "Product") {
    query = addProductFilters(req, query as any);
  } else if(table === "Address"){
    query=addAddressFilters(req,query as any);
  }

  return query as any;
}
