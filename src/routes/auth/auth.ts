import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Role } from "./register";

const authHeader = z.string();

export interface SessionRequest extends Request {
  user?: { user_id: string; role: Role };
}

// Middleware to verify JWT
export function verifySession(
  req: SessionRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const bearerHeader = authHeader.parse(req.headers["authorization"]);
    const token = z.string().parse(bearerHeader.split(" ")[1]);
    console.log(token);

    // Verify the token here
    jwt.verify(
      token,
      process.env.SECRET_TOKEN ?? "secret_key",
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid or expired token.try to login again." });
        }
        req.user = decoded as { user_id: string; role: Role };
        next();
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(403).json({
        message: "Invalid token",
        error: JSON.parse((error as z.ZodError).message),
      });
    }
  }
}

// Generate JWT
export function generateJWT(user_id: string, role: Role) {
  return jwt.sign({ user_id, role }, process.env.SECRET_TOKEN ?? "secret_key", {
    expiresIn: "7d",
  });
}


export function requireRole(role: Role) {
    return function (req: SessionRequest, res: Response, next: NextFunction) {
       // console.log(req.user);
      if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }
      next();
    };
  }
  