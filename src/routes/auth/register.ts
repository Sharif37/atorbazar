import bcrypt from "bcrypt";
import express, { RouterOptions } from "express";
import { z } from "zod";
import { db } from "../../database";
import generateToken from "./generateRandomNumber";

const routerOptions: RouterOptions = {
  caseSensitive: true,
};
const signUpRouter = express.Router(routerOptions);
const saltRound = 10;

signUpRouter.post("/user", (req, res) => {
  //console.log(req.headers);
  const { username, email, phone, password } = req.body;
  const user_id = generateToken(12);
  bcrypt.hash(password, saltRound, async function (err, hash) {
    try {
      // console.log("start inserting...");
      const result = await db
        .insertInto("User")
        .values({
          user_id: user_id,
          user_name: username,
          user_email: email,
          user_phone: phone,
          password: hash,
        }).executeTakeFirstOrThrow();

      if (result) {
        res.status(201).json({
          user_id: user_id,
          message: "User registered successfully",
        });
      } else {
        res.status(500).json({ message: "User registration failed" });
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
});


export default signUpRouter;
