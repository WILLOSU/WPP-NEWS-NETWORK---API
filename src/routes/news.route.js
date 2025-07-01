import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authRole } from "../middlewares/authRole.js"
import {
  create,
  findAll,
  findAllForAdmin, // NOVA IMPORTAÇÃO
  findById,
  topNews,
  findBySearch,
  byUser,
  upDate,
  erase,
  likesNews,
  addComment,
  deleteComment,
  moderateNews,
  hardDeleteNews,
} from "../controllers/news.controllers.js"

const router = Router()

router.post("/", authMiddleware, create)
router.get("/", findAll)

// NOVA ROTA PARA ADMIN - DEVE VIR ANTES DE /:id
router.get("/admin", authMiddleware, authRole("admin"), findAllForAdmin)

router.get("/top", topNews)
router.get("/search", findBySearch)
router.get("/byUser", authMiddleware, byUser)
router.get("/:id", authMiddleware, findById)
router.patch("/:id", authMiddleware, upDate)
router.delete("/:id", authMiddleware, erase)
router.patch("/like/:id", authMiddleware, likesNews)
router.patch("/comment/:id", authMiddleware, addComment)
router.patch("/comment/:idNews/:idComment", authMiddleware, deleteComment)
router.patch("/moderate/:id", authMiddleware, authRole("admin"), moderateNews)
router.delete("/hard/:id", authMiddleware, authRole("admin"), hardDeleteNews)

export default router
