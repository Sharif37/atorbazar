import { Request } from "express";
import { SelectQueryBuilder } from "kysely";
import { z } from "zod";
import { DB } from "../database/GeneratedSchema";
import { Address } from "../routes/address";

export function addAddressFilters(
  req: Request,
  query: SelectQueryBuilder<DB, "Address", {}>,
) {
  if (
    req.query.address_id &&
    z.string().safeParse(req.query.address_id).success
  ) {
    query = query.where(
      "Address.address_id",
      "=",
      z.string().parse(req.query.address_id),
    );
  }
  if (
    req.query.country &&
    z.string().safeParse(req.query.country).success
  ) {
    query = query.where(
      "Address.country",
      "=",
      z.string().parse(req.query.country),
    );
  }
  if (
    req.query.division &&
    z.string().safeParse(req.query.division).success
  ) {
    query = query.where(
      "Address.division",
      "=",
      z.string().parse(req.query.division),
    );
  }
  if (
    req.query.district &&
    z.string().safeParse(req.query.district).success
  ) {
    query = query.where(
     "Address.district",
      "=",
      z.string().parse(req.query.district),
    );
  }
  if (
    req.query.thana &&
    z.string().safeParse(req.query.thana).success
  ) {
    query = query.where(
      "Address.thana",
      "=",
      z.string().parse(req.query.thana),
    );
  }
  if (
    req.query.address_type &&
    z.nativeEnum(Address).safeParse(req.query.address_type).success
  ) {
    query = query.where(
      "Address.address_type",
      "=",
      z.nativeEnum(Address).parse(req.query.address_type)
    );
  }

  if (req.query.upzilla && z.string().safeParse(req.query.upzilla).success) {
    query = query.where(
     "Address.upzilla",
      "=",
      z.string().parse(req.query.upzilla),
    );
  }
  if (
    req.query.union &&
    z.string().safeParse(req.query.union).success
  ) {
    query = query.where(
      "Address.union",
      "=",
      z.string().parse(req.query.union),
    );
  }
  if (
    req.query.post_office &&
    z.string().safeParse(req.query.post_office).success
  ) {
    query = query.where(
      "Address.post_office",
      "=",
      z.string().parse(req.query.post_office),
    );
  }
  if (
    req.query.postal_code &&
    z.coerce.number().safeParse(req.query.postal_code).success
  ) {
    console.log(req.query.postal_code);
    query = query.where(
      "Address.postal_code",
      "=",
      z.coerce.number().parse(req.query.postal_code),
    );
  }
  if (
    req.query.village &&
    z.string().safeParse(req.query.village).success
  ) {
    query = query.where(
      "Address.village",
      "=",
      z.string().parse(req.query.village),
    );
  }
 
 

  return query;
}
