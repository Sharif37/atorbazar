import express from "express";
import "./loadEnviroment";
import logInRouter from "./routes/auth/login";
import registerRoute, { Role } from "./routes/auth/register";
import { requireRole, verifySession } from "./routes/auth/auth";
import myInfo from "./routes/myInfo";

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());
app.use("/api/register", registerRoute);
app.use("/api/login", logInRouter);
app.use("/api/info",myInfo);


app.listen(port, () => {
  console.log(
    `Atorbazar is listening to port ${port}\nURL: http://localhost:${port}`,
  );
});
