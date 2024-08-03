import bcrypt from "bcrypt";
import express, { RouterOptions } from "express";
import { z } from "zod";
import { db } from "../../database";
import generateToken from "./generateRandomNumber";

const routerOptions: RouterOptions = {
  caseSensitive: true,
};
const signUpRouter = express.Router(routerOptions);
const saltRounds = 10;

export enum Role {
  Customer = "Customer",
  Admin = "Admin",
  Seller = "Seller",
}


export const UserBodySchema = z.object({
  user_name: z.string().min(1),
  user_email: z.string().email(),
  user_phone: z.string().optional(),
  profile_url: z.string().url().optional(),
  password: z.string().min(5),
  coin: z.number().int().optional(),
  address_id: z.string().optional(),
});

signUpRouter.post("/customer", (req, res) => {
  const { username, email, phone, password } = req.body;
  const user_id = generateToken(12);

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error hashing password", error: err });
    }

    try {
      await db.transaction().execute(async (trx) => {
        const result = await trx
          .insertInto("User")
          .values({
            user_id: user_id,
            user_name: username,
            user_email: email,
            user_phone: phone,
            password: hash,
          })
          .executeTakeFirstOrThrow();

        if (result) {
          await trx
            .insertInto("Roles")
            .values({
              role: Role.Customer,
              user_id: user_id,
            })
            .executeTakeFirstOrThrow();

        

          res.status(201).json({
            user_id: user_id,
            message: "User registered successfully",
          });
        } else {
          throw new Error("User registration failed");
        }
      });
    } catch (error) {
      console.error("Error executing query", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          name: "Invalid data type.",
          message: JSON.parse(error.message),
        });
      }

      res.status(500).json({ message: "Error executing query", error });
    }
  });
});

signUpRouter.post("/seller", (req, res) => {
  const { username, company, email, phone, password } = req.body;
  const seller_id = generateToken(12);

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error hashing password", error: err });
    }

    try {
      await db.transaction().execute(async (trx) => {
        const result = await trx
          .insertInto("User")
          .values({
            user_id: seller_id,
            user_name: username,
            user_email: email,
            user_phone: phone,
            password: hash,
          })
          .executeTakeFirstOrThrow();

        if (result) {
          await trx
            .insertInto("Seller")
            .values({
              seller_id: seller_id,
              company_name: company,
            })
            .executeTakeFirstOrThrow();
          await trx
            .insertInto("Roles")
            .values({
              role: Role.Seller,
              user_id: seller_id,
            })
            .executeTakeFirstOrThrow();

         

          res.status(201).json({
            seller_id: seller_id,
            message: "User registered successfully",
          });
        } else {
          throw new Error("User registration failed");
        }
      });
    } catch (error) {
      console.error("Error executing query", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          name: "Invalid data type.",
          message: JSON.parse(error.message),
        });
      }

      res.status(500).json({ message: "Error executing query", error });
    }
  });
});

signUpRouter.post("/admin", (req, res) => {
  const userData = UserBodySchema.parse(req.body);
  console.log(req.body);
  const admin_id = generateToken(12);

  const user={
    user_id:admin_id,
    ...userData
  }

  bcrypt.hash(userData.password!, saltRounds, async (err, hash) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error hashing password", error: err });
    }

    try {
      await db.transaction().execute(async (trx) => {
        const result = await trx
          .insertInto("User")
          .values(user)
          .executeTakeFirstOrThrow();

        if (result) {
          await trx
            .insertInto("Admin")
            .values({
              admin_id: admin_id,
              emp_id:""
            })
            .executeTakeFirstOrThrow();
          await trx
            .insertInto("Roles")
            .values({
              role: Role.Admin,
              user_id: admin_id,
            })
            .executeTakeFirstOrThrow();

         

          res.status(201).json({
            seller_id: admin_id,
            message: "User registered successfully",
          });
        } else {
          throw new Error("User registration failed");
        }
      });
    } catch (error) {
      console.error("Error executing query", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          name: "Invalid data type.",
          message: JSON.parse(error.message),
        });
      }

      res.status(500).json({ message: "Error executing query", error });
    }
  });
});

export default signUpRouter;
