import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../swagger.json"), "utf8")
);

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

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/news", newsRoute);

app.listen(port, () => console.log(`Rodando na porta ${port}`));
