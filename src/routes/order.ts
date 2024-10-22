import express from "express";
import z from "zod";
import { db } from "../database"; // Assume you have a db instance
import { requireRole, verifySession } from "./auth/auth";
import generateToken from "./auth/generateRandomNumber";
import { Role } from "./auth/roles";
import { paginatedResults } from "../helper/paginatedResults";
import { addFiltration } from "../helper/addFiltration";


const orderRouter = express.Router();

// Zod schema for validation
const createOrderSchema = z.object({
  user_id: z.string(),
  product_id: z.string(),
  address_id: z.string(),
  seller_id: z.string(),
  transaction_id: z.string(),
  cart_id: z.string(),
  quantity: z.number().int().min(1),
  cost: z.number().positive(),
  is_confirm: z.number().int().optional(),
  status: z.number().int().optional(),
  mobile_no: z.string().length(10).optional(),
});

const updateOrderSchema = z.object({
  user_id: z.string().optional(),
  product_id: z.string().optional(),
  address_id: z.string().optional(),
  seller_id: z.string().optional(),
  transaction_id: z.string().optional(),
  cart_id: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  cost: z.number().positive().optional(),
  is_confirm: z.number().int().optional(),
  status: z.number().int().optional(),
  mobile_no: z.string().length(10).optional(), 
});

// Create a new order
orderRouter.post(
  "/addOrder",
  verifySession,
  requireRole([Role.Customer, Role.Admin]),
  async (req, res) => {
    try {
      const parsedData = createOrderSchema.parse(req.body);
      const order_id = generateToken(12);
      const orderdata = {
        order_id: order_id,
        ...parsedData,
      };
      const [result] = await db.insertInto("Order").values(orderdata).execute();
      if (result.numInsertedOrUpdatedRows === BigInt(1)) {
        res
          .status(201)
          .json({ message: "Order created successfully", order_id: order_id });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get all orders
orderRouter.get("/",verifySession,
  requireRole([Role.Customer, Role.Admin]), async (req, res) => {
  try {
    var query = db.selectFrom("Order").selectAll();
    query = addFiltration("Order", query, req);
    paginatedResults(query as any,req,res);
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get an order by ID
orderRouter.get("/:order_id",
  verifySession,
  requireRole([Role.Customer, Role.Admin]),
   async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await db
      .selectFrom("Order")
      .where("order_id", "=", order_id)
      .selectAll()
      .executeTakeFirst();
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update an order
orderRouter.put(
  "/orders/:order_id",
  verifySession,
  requireRole([Role.Admin]),
  async (req, res) => {
    try {
      const { order_id } = req.params;
      const updateData = updateOrderSchema.parse(req.body);

      const [result] = await db
        .updateTable("Order")
        .set(updateData)
        .where("order_id", "=", order_id)
        .execute();
      if (result.numUpdatedRows === BigInt(0)) {
        res.status(404).json({ message: "Order not found" });
      } else {
        res.status(200).json({ message: "Order updated successfully" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Delete an order
orderRouter.delete(
  "/delete/:order_id",
  verifySession,
  requireRole([Role.Admin]),
  async (req, res) => {
    try {
      const { order_id } = req.params;
      const [result] = await db
        .deleteFrom("Order")
        .where("order_id", "=", order_id)
        .execute();
      if (result.numDeletedRows === BigInt(0)) {
        res.status(404).json({ message: "Order not found" });
      } else {
        res.status(200).json({ message: "Order deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Confirm an order
orderRouter.patch(
  "/confirm/:order_id",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    try {
      const { order_id } = req.params;
      const { is_confirm } = z
        .object({ is_confirm: z.number().int() })
        .parse(req.body);

      const [result] = await db
        .updateTable("Order")
        .set({ is_confirm })
        .where("order_id", "=", order_id)
        .execute();
      if (result.numUpdatedRows === BigInt(0)) {
        res.status(404).json({ message: "Order not found" });
      } else {
        res.status(200).json({ message: "Order confirmed successfully" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error confirming order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Cancel an order
orderRouter.patch(
  "/cancel/:order_id",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status } = z.object({ status: z.number().int() }).parse(req.body);

      const [result] = await db
        .updateTable("Order")
        .set({ status })
        .where("order_id", "=", order_id)
        .execute();
      if (result.numUpdatedRows === BigInt(0)) {
        res.status(404).json({ message: "Order not found" });
      } else {
        res.status(200).json({ message: "Order canceled successfully" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error canceling order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get orders by user
orderRouter.get("/users/:user_id",verifySession,
  requireRole([Role.Customer, Role.Admin]), async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await db
      .selectFrom("Order")
      .where("Order.user_id", "=", user_id)
      .selectAll()
      .execute();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders for user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get orders by seller
orderRouter.get("/sellers/:seller_id",verifySession,
  requireRole([Role.Customer, Role.Admin]), async (req, res) => {
  try {
    const { seller_id } = req.params;
    const orders = await db
      .selectFrom("Order")
      .where("seller_id", "=", seller_id)
      .selectAll()
      .execute();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders for seller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get orders by status
orderRouter.get("/status/:status",verifySession,
  requireRole([Role.Customer]), async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await db
      .selectFrom("Order")
      .where("status", "=", parseInt(status))
      .selectAll()
      .execute();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default orderRouter;
