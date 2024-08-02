import { Request } from "express";
import { SelectQueryBuilder } from "kysely";
import { z } from "zod";
import { DB } from "../database/GeneratedSchema";

enum TransactionType {
  Payment = "Payment",
  Refund = "Refund",
}

enum TransactionStatus {
  Completed = "Completed",
  Pending = "Pending",
  Failed = "Failed",
}

enum PaymentMethod {
  CreditCard = "Credit Card",
  PayPal = "PayPal",
  BankTransfer = "Bank Transfer",
  Bkash = "Bkash",
  Nagad = "Nagad",
  Rocket = "Rocket",
  CashOnDelivery = "Cash On Delivery",
}

const transactionTypeEnum = z.nativeEnum(TransactionType);
const transactionStatusEnum = z.nativeEnum(TransactionStatus);
const paymentMethodEnum = z.nativeEnum(PaymentMethod);

export function addTransactionFilters(
  req: Request,
  query: SelectQueryBuilder<DB, "Transaction", {}>,
) {
  

  if (
    req.query.transaction_id &&
    z.string().safeParse(req.query.transaction_id).success
  ) {
    query = query.where(
      "Transaction.transaction_id",
      "=",
      z.string().parse(req.query.transaction_id),
    );
  }

  if (
    req.query.user_id &&
    z.string().safeParse(req.query.user_id).success
  ) {
    query = query.where(
      "Transaction.user_id",
      "=",
      z.string().parse(req.query.user_id),
    );
  }

  if (
    req.query.order_id &&
    z.string().safeParse(req.query.order_id).success
  ) {
    query = query.where(
      "Transaction.order_id",
      "=",
      z.string().parse(req.query.order_id),
    );
  }

//   if (
//     req.query.amount &&
//     z.coerce.number().safeParse(req.query.amount).success
//   ) {
//     query = query.where(
//       "Transaction.amount",
//       "=",
//       z.coerce.number().parse(req.query.amount),
//     );
//   }

  if (
    req.query.transaction_type &&
    transactionTypeEnum.safeParse(req.query.transaction_type).success
  ) {
    query = query.where(
      "Transaction.transaction_type",
      "=",
      transactionTypeEnum.parse(req.query.transaction_type),
    );
  }

  if (
    req.query.status &&
    transactionStatusEnum.safeParse(req.query.status).success
  ) {
    query = query.where(
      "Transaction.status",
      "=",
      transactionStatusEnum.parse(req.query.status),
    );
  }

  if (
    req.query.payment_method &&
    paymentMethodEnum.safeParse(req.query.payment_method).success
  ) {
    query = query.where(
      "Transaction.payment_method",
      "=",
      paymentMethodEnum.parse(req.query.payment_method),
    );
  }

  if (
    req.query.transaction_date &&
    z.string().safeParse(req.query.transaction_date).success
  ) {
    query = query.where(
      "Transaction.transaction_date",
      "=",
      z.date().parse(req.query.transaction_date),
    );
  }

  if (
    req.query.details &&
    z.string().safeParse(req.query.details).success
  ) {
    query = query.where(
      "Transaction.details",
      "like",
      `%${z.string().parse(req.query.details)}%`,
    );
  }

  return query;
}
