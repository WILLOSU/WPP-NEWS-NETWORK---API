import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDatabase from "./database/db.js";

import authRoute from "./routes/auth.route.js";
import newsRoute from "./routes/news.route.js";
import userRoute from "./routes/user.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5173;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let swaggerDocument;
try {
  const swaggerPath = path.resolve(__dirname, "../swagger.json");
  console.log(`DEBUG SWAGGER: Tentando ler swagger.json em: ${swaggerPath}`); // Log do caminho
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
  console.log("DEBUG SWAGGER: swagger.json lido com sucesso."); // Log de sucesso
} catch (err) {
  console.error("DEBUG SWAGGER: Erro ao ler swagger.json:", err.message); // Log de erro
  // Re-lançar o erro ou lidar com ele de forma apropriada
  throw new Error(
    "Falha ao carregar a documentação do Swagger: " + err.message
  );
}
// --- FIM DO CÓDIGO SWAGGER ---

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
