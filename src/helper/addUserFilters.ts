import { Request } from "express";
import { SelectQueryBuilder } from "kysely";
import { z } from "zod";
import { DB } from "../database/GeneratedSchema";

export function addUserFilters(
  req: Request,
  query: SelectQueryBuilder<DB, "User", {}>,
) {
  // Filter by user_id
  if (req.query.user_id && z.string().safeParse(req.query.user_id).success) {
    query = query.where("User.user_id", "=", z.string().parse(req.query.user_id));
  }

  // Filter by user_name
  if (req.query.name && z.string().safeParse(req.query.name).success) {
    query = query.where("User.user_name", "like", `%${z.string().parse(req.query.name)}%`);
  }

  // Filter by user_email
  if (req.query.email && z.string().safeParse(req.query.email).success) {
    query = query.where("User.user_email", "=", z.string().parse(req.query.email));
  }

  // Filter by user_phone
  if (req.query.phone && z.string().safeParse(req.query.phone).success) {
    query = query.where("User.user_phone", "=", z.string().parse(req.query.phone));
  }

  // Filter by profile_url
  if (req.query.profile_url && z.string().safeParse(req.query.profile_url).success) {
    query = query.where("User.profile_url", "like", `%${z.string().parse(req.query.profile_url)}%`);
  }

  // Filter by coin (using number)
  if (req.query.coin && z.coerce.number().safeParse(req.query.coin).success) {
    query = query.where("User.coin", "=", z.coerce.number().parse(req.query.coin));
  }

  // Filter by timestamps (date range)
  if (req.query.start_date && z.string().safeParse(req.query.start_date).success) {
    query = query.where("User.timestamps", ">=", new Date(z.string().parse(req.query.start_date)));
  }
  
  if (req.query.end_date && z.string().safeParse(req.query.end_date).success) {
    query = query.where("User.timestamps", "<=", new Date(z.string().parse(req.query.end_date)));
  }

  // Filter by address_id
  if (req.query.address_id && z.string().safeParse(req.query.address_id).success) {
    query = query.where("User.address_id", "=", z.string().parse(req.query.address_id));
  }

  return query;
}
