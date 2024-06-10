import express from "express"; // é a mesma coisa do app = express()
import userController from "../controllers/user.controllers.js"; // importando o arquivo que está a função de soma
import { validId, validUser } from "../middlewares/global.middlewares.js";

const route = express.Router();

route.post("/", userController.create);
route.get("/", userController.findAll);
route.get("/:id", validId, validUser, userController.findUserById);
route.patch("/:id", validId, validUser, userController.update);

export default route;
