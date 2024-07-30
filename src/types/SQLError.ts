export type SQLError = {
  code: string;
  errorno: number;
  message: string;
  sql: string;
  sqlState: string;
  sqlMessage: string;
};
