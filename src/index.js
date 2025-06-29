import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json' assert { type: 'json' };
import connectDatabase from "./database/db.js";

import authRoute from "./routes/auth.route.js";
import newsRoute from "./routes/news.route.js";
import userRoute from "./routes/user.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5173;

app.use(
  cors({
    origin: ["https://wppnews.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

connectDatabase();

app.use(express.json());

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/news", newsRoute);

app.listen(port, () => console.log(`Rodando na porta ${port}`));