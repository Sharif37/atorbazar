import { createPool } from "mysql2";
import { AdminCreds } from "./credentials";
import { Kysely, MysqlDialect } from "kysely";
import { DB } from "./GeneratedSchema";


const dialect = new MysqlDialect({
  pool: async () => createPool(AdminCreds),
});

const db=new Kysely<DB>({dialect,});

export type TableName =
  | 'Address'
  | 'Admin'
  | 'Auth_Session'
  | 'Cart'
  | 'Cart_Item'
  | 'Delivery'
  | 'Order'
  | 'Product'
  | 'Roles'
  | 'Seller'
  | 'User'
  | 'user_order'
  | 'Transaction' ;



export {db}
