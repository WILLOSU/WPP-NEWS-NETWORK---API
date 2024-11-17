import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDatabase from "./database/db.js";

//ROTAS
import authRoute from "./routes/auth.route.js";
import newsRoute from "./routes/news.route.js";
import swaggerRoute from "./routes/swagger.route.cjs";
import userRoute from "./routes/user.route.js"; // importando todas as rotas

dotenv.config();

const app = express();
const port = process.env.PORT || 5173;

app.use(
  cors({
    origin: ["https://wpp-news-network-spa.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

connectDatabase();

app.use(express.json()); // aplicação apta para enviar e receber arquivos json
app.use("/user", userRoute); // usando a rota
app.use("/auth", authRoute);
app.use("/news", newsRoute);
app.use("/doc", swaggerRoute);

app.listen(port, () => console.log(`Rodando na porta ${port}`));
