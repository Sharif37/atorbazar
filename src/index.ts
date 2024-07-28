import "./loadEnviroment";
import express from 'express'

const app = express() ;
const port=process.env.PORT || 3002 ;

app.use(express.json());

import registerRoute from './routes/auth/register' ;
import logInRouter from "./routes/auth/login";
app.use("/api/register",registerRoute);
app.use("/api/login",logInRouter) ;






//console.log(app) ;


// async function testConnection() {
//   try {
//     // Use the query method and properly handle the result
//     const query =
//       "INSERT INTO `e_commerce`.`User`(`user_id`,`address_id`,`user_name`,`user_email`,`user_phone`)VALUES(?,?,?,?,?)";
//     const result = await Adminpool.query(query, [
//       "2",
//       "1",
//       "omar",
//       "sharif@gmail.com",
//       "01832944519",
//     ]);
//     console.log(result); // rows contains the query result
//     // fields contains metadata about the result set
//   } catch (err) {
//     console.error("Error connecting to the database:", err);
//   } finally {
//     await Adminpool.end();
//   }
// }

// testConnection();

app.listen(port,()=>{
  console.log(`Atorbazar is listening to port ${port}\nURL: http://localhost:${port}`);

});