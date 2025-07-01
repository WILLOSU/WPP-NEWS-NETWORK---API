import News from "../models/News.js"
import User from "../models/User.js"

const createNewsService = async (body) => {
  return await News.create(body)
}

const findAllService = (limit, offset, query = { status: "published" }) =>
  News.find(query).sort({ _id: -1 }).skip(offset).limit(limit).populate("user")

const countNews = (query = { status: "published" }) => News.countDocuments(query)

const topNewsService = (query = { status: "published" }) => News.findOne(query).sort({ _id: -1 }).populate("user")

const findByIdService = (id) => News.findById(id).populate("user")

const findBySearchService = (title, limit, offset, extraQuery = { status: "published" }) =>
  News.find({
    title: { $regex: `${title || ""}`, $options: "i" },
    ...extraQuery,
  })
    .sort({ _id: -1 })
    .skip(offset)
    .limit(limit)
    .populate("user")

const countNewsFilter = (title, extraQuery = { status: "published" }) =>
  News.countDocuments({
    title: { $regex: `${title || ""}`, $options: "i" },
    ...extraQuery,
  })

// CORRIGIDO: byUserService com debug
const byUserService = (id, query = {}) => {
  console.log("DEBUG byUserService - ID recebido:", id)
  console.log("DEBUG byUserService - Tipo do ID:", typeof id)
  console.log("DEBUG byUserService - Query adicional:", query)

  // Tentar ambas as formas de busca
  const searchQuery = { user: id, ...query }
  console.log("DEBUG byUserService - Query final:", searchQuery)

  return News.find(searchQuery).sort({ _id: -1 }).populate("user")
}

const upDateService = (id, data) => News.findByIdAndUpdate({ _id: id }, data, { new: true })

const deactivateNewsService = (id) => News.findByIdAndUpdate({ _id: id }, { status: "inactive" }, { new: true })

const likesNewsService = (idNews, userId) =>
  News.findOneAndUpdate(
    { _id: idNews, "likes.userId": { $nin: [userId] } },
    { $push: { likes: { userId, created: new Date() } } },
  )

const deleteLikesNewsService = (idNews, userId) =>
  News.findOneAndUpdate({ _id: idNews }, { $pull: { likes: { userId } } })

const addCommentService = async (idNews, userId, comment) => {
  try {
    const idComment = Math.floor(Date.now() * Math.random()).toString(36)
    const { name, avatar } = await User.findOne({ _id: userId })

    const updatedNews = await News.findOneAndUpdate(
      { _id: idNews },
      {
        $push: {
          comments: {
            idComment,
            userId,
            name,
            avatar,
            comment,
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    )

    return updatedNews
  } catch (error) {
    console.log(error)
    throw new Error("Erro ao adicionar comentário: " + error.message)
  }
}

const deleteCommentService = (idNews, idComment) =>
  News.findOneAndUpdate({ _id: idNews }, { $pull: { comments: { idComment } } })

const moderateNewsService = (id, newStatus) => News.findByIdAndUpdate({ _id: id }, { status: newStatus }, { new: true })

const hardDeleteNewsService = (id) => News.findByIdAndDelete({ _id: id })

export {
  addCommentService,
  byUserService,
  countNews,
  countNewsFilter,
  createNewsService,
  deleteCommentService,
  deleteLikesNewsService,
  deactivateNewsService,
  moderateNewsService,
  findAllService,
  findByIdService,
  findBySearchService,
  likesNewsService,
  topNewsService,
  upDateService,
  hardDeleteNewsService,
}
