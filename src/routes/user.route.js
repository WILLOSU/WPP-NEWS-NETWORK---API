import express from "express"; // é a mesma coisa do app = express()
import userController from "../controllers/user.controllers.js"; // importando o arquivo que está a função de soma
import { validId, validUser } from "../middlewares/global.middlewares.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authRole } from "../middlewares/authRole.js";

const route = express.Router();

route.post("/", userController.create);
route.get("/", userController.findAll);
route.get("/", authMiddleware, authRole('admin'), userController.findAll);

route.delete("/:id", authMiddleware, userController.deleteUser);


route.get("/:id", authMiddleware, validId, validUser, userController.findUserById);
route.patch("/:id", authMiddleware, validId, validUser, userController.update);



export default route;
