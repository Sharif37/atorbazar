import express from "express";
import { db } from "../database";
import { SessionRequest, verifySession,requireRole } from "./auth/auth";
import { Role } from "./auth/register";

const myInfo = express.Router();

myInfo.get("/me",verifySession,requireRole(Role.Customer), async (req: SessionRequest, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    const user = await db
      .selectFrom("User")
      .selectAll()
      .innerJoin("Roles", "Roles.user_id", "User.user_id")
      .where("User.user_id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password="" ;
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user data", error });
  }
});

export default myInfo;
