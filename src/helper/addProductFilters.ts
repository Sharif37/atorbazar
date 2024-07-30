import { Request } from "express";
import { SelectQueryBuilder } from "kysely";
import { z } from "zod";
import { DB } from "../database/GeneratedSchema";

// Define the role enum for validation
enum Category {
  Electronics = "Electronics",
  Appliances = "Appliances",
  HomeAppliances = "Home Appliances",
  Furniture = "Furniture",
  Fashion = "Fashion",
  Beauty = "Beauty",
  Toys = "Toys",
  Automotive = "Automotive",
  Books = "Books",
  Sports = "Sports",
}
//export const CategoryEnum = zCoercedEnum(Category);

export function addProductFilters(
  req: Request,
  query: SelectQueryBuilder<DB, "Product", {}>,
) {
  if (
    req.query.product_id &&
    z.string().safeParse(req.query.product_id).success
  ) {
    query = query.where(
      "Product.product_id",
      "=",
      z.string().parse(req.query.product_id),
    );
  }
  if (
    req.query.seller_id &&
    z.string().safeParse(req.query.seller_id).success
  ) {
    query = query.where(
      "Product.seller_id",
      "=",
      z.string().parse(req.query.seller_id),
    );
  }
  if (
    req.query.package_id &&
    z.string().safeParse(req.query.package_id).success
  ) {
    query = query.where(
      "Product.package_id",
      "=",
      z.string().parse(req.query.package_id),
    );
  }
  if (
    req.query.review_id &&
    z.string().safeParse(req.query.review_id).success
  ) {
    query = query.where(
      "Product.review_id",
      "=",
      z.string().parse(req.query.review_id),
    );
  }
  if (
    req.query.product_name &&
    z.string().safeParse(req.query.product_name).success
  ) {
    query = query.where(
      "Product.product_name",
      "=",
      z.string().parse(req.query.product_name),
    );
  }
//   if (
//     req.query.category &&
//     CategoryEnum.safeParse(req.query.category).success
//   ) {
//     query = query.where("Product.category", "=", req.query.category as any);
//   }
  if (req.query.price && z.coerce.number().safeParse(req.query.price).success) {
    query = query.where(
      "Product.price",
      "=",
      z.coerce.number().parse(req.query.price),
    );
  }
  if (
    req.query.quantity &&
    z.coerce.number().safeParse(req.query.quantity).success
  ) {
    query = query.where(
      "Product.quantity",
      "=",
      z.coerce.number().parse(req.query.quantity),
    );
  }
  if (
    req.query.is_imported &&
    z.coerce.boolean().safeParse(req.query.is_imported).success
  ) {
    query = query.where(
      "Product.is_imported",
      "=",
      z.coerce.number().parse(req.query.is_imported),
    );
  }
  if (
    req.query.sub_category &&
    z.string().safeParse(req.query.sub_category).success
  ) {
    query = query.where(
      "Product.sub_category",
      "=",
      z.string().parse(req.query.sub_category),
    );
  }
  if (
    req.query.old_price &&
    z.coerce.number().safeParse(req.query.old_price).success
  ) {
    query = query.where(
      "Product.old_price",
      "=",
      z.coerce.number().parse(req.query.old_price),
    );
  }
  if (
    req.query.rating &&
    z.coerce.number().safeParse(req.query.rating).success
  ) {
    query = query.where(
      "Product.rating",
      "=",
      z.coerce.number().parse(req.query.rating),
    );
  }
  if (
    req.query.quality_type &&
    z.string().safeParse(req.query.quality_type).success
  ) {
    query = query.where(
      "Product.quality_type",
      "=",
      z.string().parse(req.query.quality_type),
    );
  }
  if (
    req.query.highlights &&
    z.string().safeParse(req.query.highlights).success
  ) {
    query = query.where(
      "Product.highlights",
      "=",
      z.string().parse(req.query.highlights),
    );
  }
  if (
    req.query.isPopular &&
    z.coerce.boolean().safeParse(req.query.isPopular).success
  ) {
    query = query.where(
      "Product.isPopular",
      "=",
      z.coerce.number().parse(req.query.isPopular),
    );
  }
  if (
    req.query.fav_count &&
    z.coerce.number().safeParse(req.query.fav_count).success
  ) {
    query = query.where(
      "Product.fav_count",
      "=",
      z.coerce.number().parse(req.query.fav_count),
    );
  }
  if (
    req.query.is_out_of_stock &&
    z.coerce.boolean().safeParse(req.query.is_out_of_stock).success
  ) {
    query = query.where(
      "Product.is_out_of_stock",
      "=",
      z.coerce.number().parse(req.query.is_out_of_stock),
    );
  }

  return query;
}
