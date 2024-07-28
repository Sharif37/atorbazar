import { createPool } from "mysql2";
import { AdminCreds } from "./credentials";
import { Kysely, MysqlDialect } from "kysely";
import { DB } from "./GeneratedSchema";


const dialect = new MysqlDialect({
  pool: async () => createPool(AdminCreds),
});

const db=new Kysely<DB>({dialect,});

// const Adminpool = createPool({
//   host: AdminCreds.host,
//   user: AdminCreds.user,
//   password: AdminCreds.password,
//   database: AdminCreds.database,
// });


export {db}
