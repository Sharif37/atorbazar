import bcrypt from "bcrypt";
import express, { RouterOptions } from "express";
import { z } from "zod";
import { db } from "../../database";
import { generateJWT, verifySession } from "./auth";
import { Role } from "./register";

const routerOptions: RouterOptions = {
  caseSensitive: true,
};
const logInRouter = express.Router(routerOptions);
const saltRound = 10;

logInRouter.post("/user", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db
      .selectFrom("User")
      .selectAll()
      .where("User.user_email", "=", email)
      .executeTakeFirst();

    if (result?.user_id) {
      const encryptedPassword = result.password!;
      bcrypt.compare(password, encryptedPassword, async (err, match) => {
        if (match) {
          const roleRecord = await db
            .selectFrom("Roles")
            .select("Roles.role")
            .where("Roles.user_id", "=", result.user_id)
            .executeTakeFirstOrThrow();
          if (roleRecord) {
            const role = roleRecord.role as Role;
            // Generate JWT token with user ID and role
            const token = generateJWT(result.user_id, role);

            res.status(200).json({
              message: "Successfully logged in",
              role: role,
              token: token,
            });
          } else {
            res.status(404).json({
              message: "Role not found for the user",
            });
          }
        } else {
          res.status(403).json({
            message: "password not match.try again",
          });
        }
      });
    } else {
      res.status(404).json({
        message: "user not found.signup first",
      });
    }
  } catch (error) {
    var typeError: z.ZodError | undefined;
    if (error instanceof z.ZodError) {
      typeError = error as z.ZodError;
      return res.status(400).json({
        name: "Invalid data type.",
        message: JSON.parse(typeError.message),
      });
    }
    res.status(500).json({ message: "Error executing query", error });
  }
});

export default logInRouter;
