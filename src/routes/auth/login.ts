import bcrypt from "bcrypt";
import express, { RouterOptions } from "express";
import { z } from "zod";
import { db } from "../../database";
import generateToken from "./generateRandomNumber";

const routerOptions: RouterOptions = {
  caseSensitive: true,
};
const logInRouter = express.Router(routerOptions);
const saltRound = 10;

logInRouter.get("/user", async (req, res) => {
  const { email, password } = req.body;
  const user_id = generateToken(12);
  try {
    const result = await db
      .selectFrom("User")
      .selectAll()
      .where("User.user_email", "=", email)
      .executeTakeFirst();

    if (result?.user_id) {
      const encryptedPassword = result?.password!;
      bcrypt.compare(password, encryptedPassword, (err, match) => {
        if (match) {
          res.status(200).json({
            message: "successfully logged in ",
          });
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
