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

productRouter.get("/:id", async (req, res) => {
  try {
    const product_id = z.coerce.string().parse(req.params.id);
    const data = await db
      .selectFrom("Product")
      .selectAll()
      .where("Product.product_id", "=", product_id)
      .executeTakeFirst();

    if (!data) {
      return res
        .status(404)
        .json({ message: "Product with id " + product_id + " not found" });
    }

    return res.status(200).json({ ...data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        name: "Invalid data type.",
        message: JSON.parse(error.message),
      });
    }

    return res.status(500).json({ message: "Internal server error", error });
  }
});

const productUpdateBody = z.object({
  seller_id: z.string().optional(),
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

productRouter.put(
  "/:id",
  verifySession,
  requireRole([Role.Seller, Role.Admin]),
  async (req, res) => {
    try {
      const product_id = z.coerce.string().parse(req.params.id);
      const productInfo = productUpdateBody.parse(req.body);
      const hasUpdate = Object.keys(productInfo).length > 0;

      if (!hasUpdate) {
        return res.status(400).json({
          name: "Invalid update.",
          message: "Nothing to update.",
        });
      }

      let query = db
        .updateTable("Product")
        .where("Product.product_id", "=", product_id);

      if (productInfo.seller_id) {
        query = query.set({
          seller_id: productInfo.seller_id,
        });
      }

      if (productInfo.product_name) {
        query = query.set({ product_name: productInfo.product_name });
      }

      if (productInfo.category) {
        query = query.set({ category: productInfo.category });
      }

      if (productInfo.price) {
        query = query.set({ price: productInfo.price });
      }

      if (productInfo.quantity) {
        query = query.set({ quantity: productInfo.quantity });
      }

      if (productInfo.is_imported !== undefined) {
        query = query.set({ is_imported: productInfo.is_imported ? 1 : 0 });
      }

      if (productInfo.sub_category) {
        query = query.set({ sub_category: productInfo.sub_category });
      }

      if (productInfo.old_price) {
        query = query.set({ old_price: productInfo.old_price });
      }

      if (productInfo.description) {
        query = query.set({
          description: JSON.stringify(productInfo.description),
        });
      }

      if (productInfo.rating) {
        query = query.set({ rating: productInfo.rating });
      }

      if (productInfo.quality_type) {
        query = query.set({ quality_type: productInfo.quality_type });
      }

      if (productInfo.terms_and_conditions) {
        query = query.set({
          terms_and_conditions: JSON.stringify(
            productInfo.terms_and_conditions,
          ),
        });
      }

      if (productInfo.highlights) {
        query = query.set({ highlights: productInfo.highlights });
      }

      if (productInfo.isPopular !== undefined) {
        query = query.set({ isPopular: productInfo.isPopular ? 1 : 0 });
      }

      if (productInfo.fav_count) {
        query = query.set({ fav_count: productInfo.fav_count });
      }

      if (productInfo.is_out_of_stock !== undefined) {
        query = query.set({
          is_out_of_stock: productInfo.is_out_of_stock ? 1 : 0,
        });
      }

      await query.execute();

      return res.status(200).json({ message: "Product updated successfully." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          name: "Invalid data type.",
          message: JSON.parse(error.message),
        });
      }
      console.error("Error updating product:", error);
      return res.status(500).json({ message: "Internal server error", error });
    }
  },
);

const productIdSchema = z.object({
  id: z.coerce.string(),
});

productRouter.delete(
  "/delete/:id",
  verifySession,
  requireRole([Role.Admin, Role.Seller]),
  async (req, res) => {
    try {
      const { id } = productIdSchema.parse(req.params);

      const query = await db
        .deleteFrom("Product")
        .where("Product.product_id", "=", id)
        .executeTakeFirst();
        console.log(query) ;

      if (query.numDeletedRows=== BigInt(0)) {
        return res.status(404).json({
          message: `Product with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          name: "Invalid data type",
          message: error.errors,
        });
      }

      console.error("Error deleting product:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }
  }
);

export default productRouter;
