import express from "express";
import { z } from "zod";
import { db } from "../database";
import { addFiltration } from "../helper/addFiltration";
import { paginatedResults } from "../helper/paginatedResults";
import { requireRole, verifySession } from "./auth/auth";
import { Role } from "./auth/roles";
import { Kysely, sql } from "kysely";

const userRouter = express.Router();

export const UserBodySchema = z.object({
  user_id: z.string(),
  user_name: z.string().min(1),
  user_email: z.string().email(),
  user_phone: z.string().optional(),
  profile_url: z.string().url().optional(),
  password: z.string().min(6).optional(),
  coin: z.number().int().optional(),
  address_id: z.string().optional(),
});

export const UpdateUserSchema = UserBodySchema.partial().omit({
  user_id: true,
});

export const PasswordUpdateSchema = z.object({
  password: z.string().min(6),
});

export const UserIdSchema = z.object({
  id: z.string(),
});


//Get All Users
userRouter.get("/", verifySession,requireRole([Role.Admin]), async (req, res) => {
  try {
    var users = db
      .selectFrom("User")
      .innerJoin("Roles","User.user_id","Roles.user_id")
      .selectAll();

    users = addFiltration("User", users as any, req);
    paginatedResults(users as any, req, res);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get User by ID
userRouter.get("/:id",requireRole([Role.Admin]), async (req, res) => {
  try {
    const { id } = UserIdSchema.parse(req.params);
    console.log(id);
    const role = await db
      .selectFrom("Roles")
      .where("Roles.user_id", "=", id)
      .select("Roles.role")
      .executeTakeFirst();
    console.log(role?.role);

    var user = db.selectFrom("User");

    if (role?.role === Role.Admin) {
      console.log("hello admin");
      user = user.leftJoin("Admin", "Admin.admin_id", "User.user_id");
    }
    if (role?.role === Role.Seller) {
      user = user.leftJoin("Seller", "Seller.seller_id", "User.user_id");
    }

    const result = await user
      .selectAll()
      .where("User.user_id", "=", id)
      .execute();
    console.log(result);

    if (!result) {
      return res.status(404).json({ message: `User with ID ${id} not found` });
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data type.",
        errors: error.errors,
      });
    }
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update User
userRouter.put(
  "/update/:id",
  verifySession,
  requireRole([Role.Admin]),
  async (req, res) => {
    try {
      const { id } = UserIdSchema.parse(req.params);
      const userUpdates = UpdateUserSchema.parse(req.body);

      const [updateResult] = await db
        .updateTable("User")
        .set(userUpdates)
        .where("user_id", "=", id)
        .execute();

      if (updateResult.numUpdatedRows === BigInt(0)) {
        return res
          .status(404)
          .json({ message: `User with ID ${id} not found` });
      }

      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Update User Password
userRouter.patch(
  "/changepass/:id",
  verifySession,
  requireRole([Role.Admin,Role.Customer,Role.Customer]),
  async (req, res) => {
    try {
      const { id } = UserIdSchema.parse(req.params);
      const { password } = PasswordUpdateSchema.parse(req.body);

      await db
        .updateTable("User")
        .set({ password })
        .where("user_id", "=", id)
        .execute();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Delete User
userRouter.delete(
  "/delete/:id",
  verifySession,
  requireRole([Role.Admin]), // Assuming only Admin can delete users
  async (req, res) => {
    try {
      const { id } = UserIdSchema.parse(req.params);
      const [deleteResult] = await db
        .deleteFrom("User")
        .where("user_id", "=", id)
        .execute();

      if (deleteResult.numDeletedRows === BigInt(0)) {
        return res
          .status(404)
          .json({ message: `User with ID ${id} not found` });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default userRouter;
