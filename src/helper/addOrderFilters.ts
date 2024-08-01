import { Request } from "express";
import { SelectQueryBuilder } from "kysely";
import { z } from "zod";
import { DB } from "../database/GeneratedSchema";


enum OrderStatus {
  Pending = 0,
  Completed = 1,
  Cancelled = 2,
}

enum ConfirmationStatus {
  NotConfirmed = 0,
  Confirmed = 1,
}

// Define the schema for validation
const orderStatusEnum = z.nativeEnum(OrderStatus);
const confirmationStatusEnum = z.nativeEnum(ConfirmationStatus);

export function addOrderFilters(
  req: Request,
  query: SelectQueryBuilder<DB, "Order", {}>,
) {
  // Validate and apply filters based on query parameters

  if (
    req.query.order_id &&
    z.string().safeParse(req.query.order_id).success
  ) {
    query = query.where(
      "Order.order_id",
      "=",
      z.string().parse(req.query.order_id),
    );
  }

  if (
    req.query.user_id &&
    z.string().safeParse(req.query.user_id).success
  ) {
    query = query.where(
      "Order.user_id",
      "=",
      z.string().parse(req.query.user_id),
    );
  }

  if (
    req.query.product_id &&
    z.string().safeParse(req.query.product_id).success
  ) {
    query = query.where(
      "Order.product_id",
      "=",
      z.string().parse(req.query.product_id),
    );
  }

  if (
    req.query.address_id &&
    z.string().safeParse(req.query.address_id).success
  ) {
    query = query.where(
      "Order.address_id",
      "=",
      z.string().parse(req.query.address_id),
    );
  }

  if (
    req.query.seller_id &&
    z.string().safeParse(req.query.seller_id).success
  ) {
    query = query.where(
      "Order.seller_id",
      "=",
      z.string().parse(req.query.seller_id),
    );
  }

  if (
    req.query.transaction_id &&
    z.string().safeParse(req.query.transaction_id).success
  ) {
    query = query.where(
      "Order.transaction_id",
      "=",
      z.string().parse(req.query.transaction_id),
    );
  }

  if (
    req.query.cart_id &&
    z.string().safeParse(req.query.cart_id).success
  ) {
    query = query.where(
      "Order.cart_id",
      "=",
      z.string().parse(req.query.cart_id),
    );
  }

  if (
    req.query.quantity &&
    z.coerce.number().safeParse(req.query.quantity).success
  ) {
    query = query.where(
      "Order.quantity",
      "=",
      z.coerce.number().parse(req.query.quantity),
    );
  }

//   if (
//     req.query.cost &&
//     z.coerce.number().safeParse(req.query.cost).success
//   ) {
//     query = query.where(
//       "Order.cost",
//       "=",
//       z.coerce.number().parse(req.query.cost),
//     );
//   }

  if (
    req.query.is_confirm &&
    confirmationStatusEnum.safeParse(req.query.is_confirm).success
  ) {
    query = query.where(
      "Order.is_confirm",
      "=",
      confirmationStatusEnum.parse(req.query.is_confirm),
    );
  }

  if (
    req.query.status &&
    orderStatusEnum.safeParse(req.query.status).success
  ) {
    query = query.where(
      "Order.status",
      "=",
      orderStatusEnum.parse(req.query.status),
    );
  }

  if (
    req.query.mobile_no &&
    z.string().safeParse(req.query.mobile_no).success
  ) {
    query = query.where(
      "Order.mobile_no",
      "=",
      z.string().parse(req.query.mobile_no),
    );
  }

  if (
    req.query.time_stamp &&
    z.string().safeParse(req.query.time_stamp).success
  ) {
    query = query.where(
      "Order.time_stamp",
      "=",
      z.date().parse(req.query.time_stamp),
    );
  }

  return query;
}
