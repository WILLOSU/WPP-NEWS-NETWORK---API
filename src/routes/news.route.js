import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authRole } from "../middlewares/authRole.js";

import {
  create,
  findAll,
  findById,
  topNews,
  findBySearch,
  byUser,
  upDate,
  erase,
  likesNews,
  addComment,
  deleteComment,
  moderateNews, // <--- GARANTA QUE moderateNews ESTEJA IMPORTADO AQUI
  hardDeleteNews,
} from "../controllers/news.controllers.js"; // <--- E que a importação seja do news.controllers.js

const router = Router(); // Use 'router' aqui, não 'route' para news.routes.js

router.post("/", authMiddleware, create);
router.get("/", findAll);
router.get("/top", topNews);
router.get("/search", findBySearch);
router.get("/byUser", authMiddleware, byUser);
router.get("/:id", authMiddleware, findById);
router.patch("/:id", authMiddleware, upDate);
router.delete("/:id", authMiddleware, erase);
router.patch("/like/:id", authMiddleware, likesNews);
router.patch("/comment/:id", authMiddleware, addComment);
router.patch("/comment/:idNews/:idComment", authMiddleware, deleteComment);

router.patch("/moderate/:id", authMiddleware, authRole("admin"), moderateNews); // <--- Agora 'moderateNews' será definido

router.delete("/hard/:id", authMiddleware, authRole('admin'), hardDeleteNews); // Nova rota de hard delete

export default router; // Use 'router' aqui
