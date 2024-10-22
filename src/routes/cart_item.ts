import express from "express";
import z from "zod";
import { db } from "../database";
import { requireRole, verifySession } from "./auth/auth";
import generateToken from "./auth/generateRandomNumber";
import { Role } from "./auth/roles";

const cartItemRouter = express.Router();

// Schema for creating and updating cart items
const cartItemSchema = z.object({
  user_id: z.string(),
  product_id: z.string(),
  cost: z.number().nonnegative(),
  status: z.boolean().transform((val) => (val ? 1 : 0)),
  quantity: z.number().int().positive(),
});

// Add Item to Cart
cartItemRouter.post(
  "/addCartItem",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    try {
      const cartItemData = cartItemSchema.parse(req.body);
      const [query] = await db
        .selectFrom("Cart")
        .where("Cart.user_id", "=", cartItemData.user_id)
        .select("Cart.cart_id")
        .execute();

      //console.log(query);
      if (query.cart_id) {
        await db
          .insertInto("Cart_Item")
          .values({
            cart_id: query.cart_id,
            product_id: cartItemData.product_id,
            cost: cartItemData.cost,
            status: cartItemData.status,
            quantity: cartItemData.quantity,
          })
          .executeTakeFirstOrThrow();

        res.status(201).json({
          message: "Item added to cart successfully",
          cartItem: query.cart_id,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }

      if (error instanceof Error) {
        if (error.message.includes("Duplicate entry")) {
          return res.status(409).json({
            message: `Duplicate entry is not allowed.`,
          });
        }
      }
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

cartItemRouter.post(
  "/addCart/:user_id",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    const user_id = z.string().parse(req.params.user_id);
    try {
      const cart_id = generateToken(8);

      // Check if a cart already exists for this user
      const existingCart = await db
        .selectFrom("Cart")
        .where("Cart.user_id", "=", user_id)
        .select("Cart.cart_id")
        .executeTakeFirst();

      if (existingCart) {
        // Cart already exists
        return res.status(409).json({
          message: `User with ID ${user_id} already has a cart.`,
          cart_id: existingCart.cart_id,
        });
      }

      // Insert new cart record
      await db.insertInto("Cart").values({ cart_id, user_id }).execute();

      return res.status(201).json({
        message: "Cart added successfully",
        cart_id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }

      if (error instanceof Error) {
        if (error.message.includes("Duplicate entry")) {
          return res.status(409).json({
            message: `User with ID ${user_id} already has a cart. Duplicate entry is not allowed.`,
          });
        }
      }
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get All Items in Cart
cartItemRouter.get(
  "/:cart_id",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    try {
      const cart_id = z.string().parse(req.params.cart_id);

      const cartItems = await db
        .selectFrom("Cart_Item")
        .where("Cart_Item.cart_id", "=", cart_id)
        .selectAll()
        .execute();

      res.status(200).json(cartItems);
    } catch (error) {
      console.error("Error retrieving cart items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get All Items of a current user
cartItemRouter.get(
  "/user/:user_id",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    try {
      const user_id = z.string().parse(req.params.user_id);

      const cartItems = await db
        .selectFrom("Cart")
        .innerJoin("Cart_Item", "Cart.cart_id", "Cart_Item.cart_id")
        .where("Cart.user_id", "=", user_id)
        .selectAll()
        .execute();

      res.status(200).json(cartItems);
    } catch (error) {
      console.error("Error retrieving cart items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

const cartItemUpdateSchema = z.object({
  cost: z.coerce.number().optional(),
  status: z.boolean().transform((val) => (val ? 1 : 0)).optional(),
  quantity: z.coerce.number().optional(),
});

// Update Cart Item
cartItemRouter.put(
  "/:cart_id/:product_id",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    
    try {
      const cart_id = z.string().parse(req.params.cart_id);
      const product_id = z.string().parse(req.params.product_id);
      const cartItemData = cartItemUpdateSchema.parse(req.body);
      const hasUpdate = Object.keys(cartItemData).length > 0;
      console.log(cartItemData);

      if (!hasUpdate) {
        return res.status(400).json({
          name: "Invalid update.",
          message: "Nothing to update.",
        });
      }
      let query = db
        .updateTable("Cart_Item")
        .where("Cart_Item.cart_id", "=", cart_id)
        .where("Cart_Item.product_id", "=", product_id);

      if (cartItemData.cost) {
        query = query.set({ cost: cartItemData.cost, });
      }
      if (cartItemData.quantity) {
        query = query.set({ quantity: cartItemData.quantity, });
      }
      if (cartItemData.status) {
        query = query.set({ status: cartItemData.status, });
      }

      await query.execute();

      res.status(200).json({ message: "Cart item updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Delete Cart Item
cartItemRouter.delete(
  "/:cart_id/:product_id",
  verifySession,
  requireRole([Role.Customer, Role.Admin]),
  async (req, res) => {
    try {
      const cart_id = z.string().parse(req.params.cart_id);
      const product_id = z.string().parse(req.params.product_id);

      const query = await db
        .deleteFrom("Cart_Item")
        .where("Cart_Item.cart_id", "=", cart_id)
        .where("Cart_Item.product_id", "=", product_id)
        .executeTakeFirst();

      if (query.numDeletedRows === BigInt(0)) {
        return res.status(404).json({
          message: `Cart item with cart ID ${cart_id} and product ID ${product_id} not found`,
        });
      }

      res.status(200).json({
        message: "Cart item deleted successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error("Error deleting cart item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default cartItemRouter;
