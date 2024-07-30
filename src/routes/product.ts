import express from "express";
import z from "zod";
import { db } from "../database";
import { addFiltration } from "../helper/addFiltration";
import { paginatedResults } from "../helper/paginatedResults";
import { requireRole, verifySession } from "./auth/auth";
import { Role } from "./auth/register";

const productRouter = express.Router();

const productBody = z.object({
  product_id: z.string(),
  seller_id: z.string(),
  package_id: z.string(),
  review_id: z.string(),
  product_name: z.string().optional(),
  category: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  is_imported: z.boolean().optional(),
  sub_category: z.string().optional(),
  old_price: z.number().optional(),
  description: z.any().optional(),
  rating: z.number().min(0).max(5).optional(),
  quality_type: z.string().optional(),
  terms_and_conditions: z.any().optional(),
  highlights: z.string().optional(),
  isPopular: z.boolean().optional(),
  fav_count: z.number().optional(),
  is_out_of_stock: z.boolean().optional(),
});

productRouter.post(
  "/addproduct",
  verifySession,
  requireRole([Role.Seller, Role.Customer]),
  async (req, res) => {
    try {
      const productData = productBody.parse(req.body);

      const dbProductData = {
        ...productData,
        description: productData.description
          ? JSON.stringify(productData.description)
          : null,
        terms_and_conditions: productData.terms_and_conditions
          ? JSON.stringify(productData.terms_and_conditions)
          : null,
        is_imported: productData.is_imported ? 1 : 0,
        isPopular: productData.isPopular ? 1 : 0,
        is_out_of_stock: productData.is_out_of_stock ? 1 : 0,
      };

      const result = await db
        .insertInto("Product")
        .values(dbProductData)
        .executeTakeFirstOrThrow();

      const convertedResult = JSON.parse(
        JSON.stringify(result, (key, value) =>
          typeof value === "bigint" ? value.toString() : value,
        ),
      );
      res.status(201).json({
        message: "Product added successfully",
        product: convertedResult,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

productRouter.get("/allProduct", verifySession, async (req, res) => {
  try {
    var query = db.selectFrom("Product").selectAll();
    query = addFiltration("Product", query, req);
    paginatedResults(query as any, req, res);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

export default productRouter;
