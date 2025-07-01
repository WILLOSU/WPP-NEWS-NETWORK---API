import {
  addCommentService,
  byUserService,
  countNews,
  countNewsFilter,
  createNewsService,
  deleteCommentService,
  findAllService,
  findByIdService,
  findBySearchService,
  likesNewsService,
  topNewsService,
  upDateService,
  moderateNewsService,
  hardDeleteNewsService,
} from "../services/news.service.js"
import userService from "../services/user.service.js"

// NOVA FUNÇÃO PARA ADMIN - BUSCA TODAS AS NOTÍCIAS
const findAllForAdmin = async (req, res) => {
  try {
    let { limit, offset, status } = req.query

    limit = Number(limit) || 10
    offset = Number(offset) || 0

    // Admin pode filtrar por status específico ou ver todas
    const query = {}
    if (status) {
      // Se status for fornecido, filtra por ele
      const statusArray = status.split(",")
      query.status = { $in: statusArray }
    }
    // Se não fornecer status, busca TODAS (sem filtro)

    console.log("DEBUG - Query para admin:", query)

    const news = await findAllService(limit, offset, query)
    const total = await countNews(query)

    const currentUrl = req.baseUrl
    const next = offset + limit
    const nextUrl = next < total ? `${currentUrl}/admin?limit=${limit}&offset=${next}` : null
    const previous = offset - limit < 0 ? null : offset - limit
    const previousUrl = previous !== null ? `${currentUrl}/admin?limit=${limit}&offset=${previous}` : null

    if (news.length === 0) {
      return res.status(200).send({
        results: [],
        message: "Não há notícias encontradas.",
      })
    }

    res.send({
      nextUrl,
      previousUrl,
      limit,
      offset,
      total,
      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        userName: item.user.username,
        userAvatar: item.user.avatar,
        creatAt: item.createdAt,
        status: item.status, // IMPORTANTE: inclui o status
      })),
    })
  } catch (error) {
    console.error("Erro no findAllForAdmin:", error)
    res.status(500).send({ message: error.message })
  }
}

// Mantenha todas as outras funções existentes...
const create = async (req, res) => {
  try {
    const { title, text, banner } = req.body

    if (!title || !text) {
      return res.status(400).send({
        message: "Por favor, envie o título e o texto para registro.",
      })
    }

    const createdAt = new Date()
    const userId = req.userId
    const userLogado = await userService.findByIdService(userId)

    const newsStatus = userLogado && userLogado.role === "admin" ? "published" : "pending"

    const newsData = {
      title,
      text,
      banner,
      createdAt,
      user: userId,
      likes: [],
      comments: [],
      status: newsStatus,
    }

    const news = await createNewsService(newsData)

    if (!news) {
      return res.status(400).send({ message: "Erro ao criar notícia." })
    }

    res.status(201).send({
      message: "Notícia criada com sucesso!",
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        createdAt: news.createdAt,
        status: news.status,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const findAll = async (req, res) => {
  try {
    let { limit, offset } = req.query

    limit = Number(limit)
    offset = Number(offset)

    if (!limit) {
      limit = 5
    }
    if (!offset) {
      offset = 0
    }

    const news = await findAllService(limit, offset, { status: "published" })
    const total = await countNews({ status: "published" })

    const currentUrl = req.baseUrl
    const next = offset + limit
    const nextUrl = next < total ? `${currentUrl}?limit=${limit}&offset=${next}` : null
    const previous = offset - limit < 0 ? null : offset - limit
    const previousUrl = previous !== null ? `${currentUrl}?limit=${limit}&offset=${previous}` : null

    if (news.length === 0) {
      return res.status(200).send({
        results: [],
        message: "Não há notícias publicadas no momento.",
      })
    }

    res.send({
      nextUrl,
      previousUrl,
      limit,
      offset,
      total,
      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        userName: item.user.username,
        userAvatar: item.user.avatar,
        creatAt: item.createdAt,
        status: item.status,
      })),
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const addComment = async (req, res) => {
  try {
    const { newsId, comment } = req.body
    const userId = req.userId

    const updatedNews = await addCommentService(newsId, comment, userId)

    if (!updatedNews) {
      return res.status(400).send({ message: "Erro ao adicionar comentário." })
    }

    res.status(201).send({
      message: "Comentário adicionado com sucesso!",
      news: {
        id: updatedNews._id,
        title: updatedNews.title,
        text: updatedNews.text,
        banner: updatedNews.banner,
        likes: updatedNews.likes,
        comments: updatedNews.comments,
        name: updatedNews.user.name,
        userName: updatedNews.user.username,
        userAvatar: updatedNews.user.avatar,
        creatAt: updatedNews.createdAt,
        status: updatedNews.status,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const byUser = async (req, res) => {
  try {
    const { userId } = req.params
    let { limit, offset } = req.query

    limit = Number(limit) || 5
    offset = Number(offset) || 0

    const news = await byUserService(userId, limit, offset)
    const total = await countNewsFilter({ user: userId })

    const currentUrl = req.baseUrl
    const next = offset + limit
    const nextUrl = next < total ? `${currentUrl}/${userId}?limit=${limit}&offset=${next}` : null
    const previous = offset - limit < 0 ? null : offset - limit
    const previousUrl = previous !== null ? `${currentUrl}/${userId}?limit=${limit}&offset=${previous}` : null

    if (news.length === 0) {
      return res.status(200).send({
        results: [],
        message: "Não há notícias encontradas para este usuário.",
      })
    }

    res.send({
      nextUrl,
      previousUrl,
      limit,
      offset,
      total,
      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        userName: item.user.username,
        userAvatar: item.user.avatar,
        creatAt: item.createdAt,
        status: item.status,
      })),
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const deleteComment = async (req, res) => {
  try {
    const { newsId, commentId } = req.params
    const userId = req.userId

    const updatedNews = await deleteCommentService(newsId, commentId, userId)

    if (!updatedNews) {
      return res.status(400).send({ message: "Erro ao deletar comentário." })
    }

    res.status(200).send({
      message: "Comentário deletado com sucesso!",
      news: {
        id: updatedNews._id,
        title: updatedNews.title,
        text: updatedNews.text,
        banner: updatedNews.banner,
        likes: updatedNews.likes,
        comments: updatedNews.comments,
        name: updatedNews.user.name,
        userName: updatedNews.user.username,
        userAvatar: updatedNews.user.avatar,
        creatAt: updatedNews.createdAt,
        status: updatedNews.status,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const erase = async (req, res) => {
  try {
    const { newsId } = req.params

    const result = await hardDeleteNewsService(newsId)

    if (!result) {
      return res.status(400).send({ message: "Erro ao deletar notícia permanentemente." })
    }

    res.status(200).send({ message: "Notícia deletada permanentemente com sucesso!" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const findById = async (req, res) => {
  try {
    const { newsId } = req.params

    const news = await findByIdService(newsId)

    if (!news) {
      return res.status(404).send({ message: "Notícia não encontrada." })
    }

    res.send({
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        likes: news.likes,
        comments: news.comments,
        name: news.user.name,
        userName: news.user.username,
        userAvatar: news.user.avatar,
        creatAt: news.createdAt,
        status: news.status,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const findBySearch = async (req, res) => {
  try {
    const { query } = req.params
    let { limit, offset } = req.query

    limit = Number(limit) || 5
    offset = Number(offset) || 0

    const news = await findBySearchService(query, limit, offset)
    const total = await countNewsFilter({ title: { $regex: query, $options: "i" } })

    const currentUrl = req.baseUrl
    const next = offset + limit
    const nextUrl = next < total ? `${currentUrl}/search/${query}?limit=${limit}&offset=${next}` : null
    const previous = offset - limit < 0 ? null : offset - limit
    const previousUrl = previous !== null ? `${currentUrl}/search/${query}?limit=${limit}&offset=${previous}` : null

    if (news.length === 0) {
      return res.status(200).send({
        results: [],
        message: "Não há notícias encontradas com essa busca.",
      })
    }

    res.send({
      nextUrl,
      previousUrl,
      limit,
      offset,
      total,
      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        userName: item.user.username,
        userAvatar: item.user.avatar,
        creatAt: item.createdAt,
        status: item.status,
      })),
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const likesNews = async (req, res) => {
  try {
    const { newsId } = req.params
    const userId = req.userId

    const updatedNews = await likesNewsService(newsId, userId)

    if (!updatedNews) {
      return res.status(400).send({ message: "Erro ao curtir notícia." })
    }

    res.status(200).send({
      message: "Notícia curtida com sucesso!",
      news: {
        id: updatedNews._id,
        title: updatedNews.title,
        text: updatedNews.text,
        banner: updatedNews.banner,
        likes: updatedNews.likes,
        comments: updatedNews.comments,
        name: updatedNews.user.name,
        userName: updatedNews.user.username,
        userAvatar: updatedNews.user.avatar,
        creatAt: updatedNews.createdAt,
        status: updatedNews.status,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const topNews = async (req, res) => {
  try {
    const news = await topNewsService()
    const total = news.length

    if (news.length === 0) {
      return res.status(200).send({
        results: [],
        message: "Não há notícias em destaque no momento.",
      })
    }

    res.send({
      total,
      results: news.map((item) => ({
        id: item._id,
        title: item.title,
        text: item.text,
        banner: item.banner,
        likes: item.likes,
        comments: item.comments,
        name: item.user.name,
        userName: item.user.username,
        userAvatar: item.user.avatar,
        creatAt: item.createdAt,
        status: item.status,
      })),
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const upDate = async (req, res) => {
  try {
    const { newsId } = req.params
    const { title, text, banner } = req.body
    const userId = req.userId

    const updatedNews = await upDateService(newsId, { title, text, banner }, userId)

    if (!updatedNews) {
      return res.status(400).send({ message: "Erro ao atualizar notícia." })
    }

    res.status(200).send({
      message: "Notícia atualizada com sucesso!",
      news: {
        id: updatedNews._id,
        title: updatedNews.title,
        text: updatedNews.text,
        banner: updatedNews.banner,
        likes: updatedNews.likes,
        comments: updatedNews.comments,
        name: updatedNews.user.name,
        userName: updatedNews.user.username,
        userAvatar: updatedNews.user.avatar,
        creatAt: updatedNews.createdAt,
        status: updatedNews.status,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const moderateNews = async (req, res) => {
  try {
    const { newsId } = req.params
    const { status } = req.body
    const userId = req.userId

    const updatedNews = await moderateNewsService(newsId, status, userId)

    if (!updatedNews) {
      return res.status(400).send({ message: "Erro ao moderar notícia." })
    }

    res.status(200).send({
      message: "Notícia moderada com sucesso!",
      news: {
        id: updatedNews._id,
        title: updatedNews.title,
        text: updatedNews.text,
        banner: updatedNews.banner,
        likes: updatedNews.likes,
        comments: updatedNews.comments,
        name: updatedNews.user.name,
        userName: updatedNews.user.username,
        userAvatar: updatedNews.user.avatar,
        creatAt: updatedNews.createdAt,
        status: updatedNews.status,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

const hardDeleteNews = async (req, res) => {
  try {
    const { newsId } = req.params

    const result = await hardDeleteNewsService(newsId)

    if (!result) {
      return res.status(400).send({ message: "Erro ao deletar notícia permanentemente." })
    }

    res.status(200).send({ message: "Notícia deletada permanentemente com sucesso!" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: error.message })
  }
}

export {
  addComment,
  byUser,
  create,
  deleteComment,
  erase,
  findAll,
  findAllForAdmin, // NOVA FUNÇÃO EXPORTADA
  findById,
  findBySearch,
  likesNews,
  topNews,
  upDate,
  moderateNews,
  hardDeleteNews,
}
