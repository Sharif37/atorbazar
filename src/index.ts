import express from "express";
import "./loadEnviroment";
import logInRouter from "./routes/auth/login";
import registerRoute from "./routes/auth/register";
import myInfo from "./routes/myInfo";
import productRouter from "./routes/product";

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

app.use("/api/register", registerRoute);
app.use("/api/login", logInRouter);
app.use("/api/info", myInfo);

//product routes
app.use("/api/product", productRouter);

app.listen(port, () => {
  console.log(
    `Atorbazar is listening to port ${port}\nURL: http://localhost:${port}`,
  );
});
