import express from "express";
import z from "zod";
import { db } from "../database";
import { addFiltration } from "../helper/addFiltration";
import { paginatedResults } from "../helper/paginatedResults";
import { requireRole, verifySession } from "./auth/auth";
import { Role } from "./auth/roles";

const addressRouter = express.Router();
export enum Address {
  Presend = "present_address",
  Delivery = "delivery_address",
}
const addressBody = z.object({
  address_id: z.string(),
  country: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upzilla: z.string().optional(),
  thana: z.string().optional(),
  union: z.string().optional(),
  post_office: z.string().optional(),
  village: z.string().optional(),
  postal_code: z.number().optional(),
  address_type: z.enum(["delivery_address", "present_address"])
});

addressRouter.post(
  "/addAddress",
  verifySession,
  requireRole([Role.Customer]),
  async (req, res) => {
    try {
      const addressData = addressBody.parse(req.body);

      const result = await db
        .insertInto("Address")
        .values(addressData)
        .executeTakeFirstOrThrow();

      if(result){
        res.status(201).json({
            message: "Address added successfully",
            address: addressData.address_id,
          });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error("Error adding address:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

addressRouter.get("/", verifySession, async (req, res) => {
  try {
    var query = db.selectFrom("Address").selectAll();
    query = addFiltration("Address", query, req);
    paginatedResults(query as any, req, res);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

addressRouter.get("/:id", async (req, res) => {
  try {
    const address_id = z.coerce.string().parse(req.params.id);
    const data = await db
      .selectFrom("Address")
      .selectAll()
      .where("Address.address_id", "=", address_id)
      .executeTakeFirst();

    if (!data) {
      return res
        .status(404)
        .json({ message: "Address with id " + address_id + " not found" });
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

const addressUpdateBody = z.object({
  country: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upzilla: z.string().optional(),
  thana: z.string().optional(),
  union: z.string().optional(),
  post_office: z.string().optional(),
  village: z.string().optional(),
  postal_code: z.number().optional(),
  address_type: z.enum(["delivery_address", "present_address"]).optional(),
});
type AddressUpdateBody = z.infer<typeof addressUpdateBody>;
addressRouter.put(
  "/:id",
  verifySession,
  requireRole([Role.Seller, Role.Admin]),
  async (req, res) => {
    try {
      const address_id = z.coerce.string().parse(req.params.id);
      const addressInfo = addressUpdateBody.parse(req.body);
      const hasUpdate = Object.keys(addressInfo).length > 0;

      if (!hasUpdate) {
        return res.status(400).json({
          name: "Invalid update.",
          message: "Nothing to update.",
        });
      }

      let query = db
        .updateTable("Address")
        .where("Address.address_id", "=", address_id);

      (Object.keys(addressInfo) as (keyof AddressUpdateBody)[]).forEach(
        (key) => {
          query = query.set({ [key]: addressInfo[key] });
        },
      );

      await query.execute();

      return res.status(200).json({ message: "Address updated successfully." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          name: "Invalid data type.",
          message: JSON.parse(error.message),
        });
      }
      console.error("Error updating address:", error);
      return res.status(500).json({ message: "Internal server error", error });
    }
  },
);

const addressIdSchema = z.object({
  id: z.coerce.string(),
});

addressRouter.delete(
  "/delete/:id",
  verifySession,
  requireRole([Role.Seller, Role.Customer]),
  async (req, res) => {
    try {
      const { id } = addressIdSchema.parse(req.params);

      const query = await db
        .deleteFrom("Address")
        .where("Address.address_id", "=", id)
        .executeTakeFirst();

      if (query.numDeletedRows === BigInt(0)) {
        return res.status(404).json({
          message: `Address with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        message: "Address deleted successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          name: "Invalid data type",
          message: error.errors,
        });
      }

      console.error("Error deleting address:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }
  },
);

export default addressRouter;
