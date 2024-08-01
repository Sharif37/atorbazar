import type { ColumnType } from "kysely";

export type Decimal = ColumnType<string, number | string, number | string>;

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export interface Address {
  address_id: string;
  address_type: "delivery_address" | "present_address";
  country: string | null;
  district: string | null;
  division: string | null;
  post_office: string | null;
  postal_code: number | null;
  thana: string | null;
  union: string | null;
  upzilla: string | null;
  village: string | null;
}

export interface Admin {
  admin_id: number;
  email: string | null;
  emp_id: number;
  first_name: string | null;
  last_name: string | null;
  mobile: string | null;
  password: string | null;
  role_type: string | null;
  username: string | null;
}

export interface AuthSession {
  created_at: Generated<Date>;
  session_id: string;
  user_id: string;
}

export interface Cart {
  cart_id: string;
  user_id: string;
}

export interface CartItem {
  cart_id: string;
  cost: number | null;
  product_id: string;
  quantity: number | null;
  status: number | null;
}

export interface Delivery {
  address_id: string;
  cart_id: string;
  delivery_contact: string | null;
  delivery_date: Date | null;
  delivery_id: number;
  delivery_status: string | null;
  order_id: string;
  product_id: string;
  seller_id: string;
  user_id: string;
}

export interface Order {
  address_id: string;
  cart_id: string;
  cost: Decimal | null;
  is_confirm: number | null;
  mobile_no: string | null;
  order_id: string;
  product_id: string;
  quantity: number | null;
  seller_id: string;
  status: number | null;
  time_stamp: Generated<Date | null>;
  transaction_id: string;
  user_id: string;
}

export interface Product {
  category: string | null;
  description: Json | null;
  fav_count: number | null;
  highlights: string | null;
  is_imported: number | null;
  is_out_of_stock: number | null;
  isPopular: number | null;
  old_price: number | null;
  package_id: string;
  price: number | null;
  product_id: string;
  product_name: string | null;
  quality_type: string | null;
  quantity: number | null;
  rating: number | null;
  review_id: string;
  seller_id: string;
  sub_category: string | null;
  terms_and_conditions: Json | null;
}

export interface Roles {
  end_date: Date | null;
  role: string;
  start_date: Generated<Date>;
  user_id: string;
}

export interface Seller {
  company_name: string | null;
  isApproved: Generated<number | null>;
  seller_id: string;
}

export interface Transaction {
  amount: Decimal;
  details: string | null;
  order_id: string;
  payment_method: "Bank Transfer" | "Bkash" | "Cash On Delivery" | "Credit Card" | "Nagad" | "PayPal" | "Rocket";
  status: "Completed" | "Failed" | "Pending";
  transaction_date: Generated<Date | null>;
  transaction_id: string;
  transaction_type: "Payment" | "Refund";
  user_id: string;
}

export interface User {
  address_id: string | null;
  coin: Generated<number | null>;
  password: string | null;
  profile_url: string | null;
  timestamps: Generated<Date | null>;
  user_email: string;
  user_id: string;
  user_name: string;
  user_phone: string | null;
}

export interface UserOrder {
  order_id: string;
  user_id: string;
}

export interface DB {
  Address: Address;
  Admin: Admin;
  Auth_Session: AuthSession;
  Cart: Cart;
  Cart_Item: CartItem;
  Delivery: Delivery;
  Order: Order;
  Product: Product;
  Roles: Roles;
  Seller: Seller;
  Transaction: Transaction;
  User: User;
  user_order: UserOrder;
}
