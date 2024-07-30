import { Request, Response } from "express";
import { SelectQueryBuilder } from "kysely";
import { TableName } from "../database";
import { DB } from "../database/GeneratedSchema";
import { SQLError } from "../types/SQLError";

export async function paginatedResults(
  query: SelectQueryBuilder<DB, TableName, any>,
  req: Request,
  res: Response,
) {
  try {
    if (req.query.limit === "all") {
      const data = await query.execute();
      return res.status(200).json(data);
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(3, Number(req.query.limit) || 10);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const data = await query.limit(limit).offset(startIndex).execute();

    const count = await query
      .clearSelect()
      .select(({ fn, val, ref }) => [fn.countAll<number>().as("total")])
      .executeTakeFirst();

    const totalRecords = count ? count.total : 0;

    // console.log(`Received ${req.method} request for ${req.url}`);
    // console.log('Query Parameters:', req.query);
    // console.log('Body:', req.body);

    const result = {
      total_records: totalRecords,
      total_data: data.length,
      data,
      page_count: Math.ceil(totalRecords / limit),
      first_page: 1,
      next:
        endIndex < totalRecords
          ? {
              page: page + 1,
              limit,
            }
          : null,
      previous:
        page > 1
          ? {
              page: page - 1,
              limit,
            }
          : null,
    };

    return res.status(200).json(result);
  } catch (error) {
    try {
      const sqlError = error as SQLError;
      return res.status(500).json({
        message: "Invalid query",
        error: sqlError.message,
        errorno: sqlError.errorno,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error,
      });
    }
  }
}
