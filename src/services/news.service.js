import News from "../models/News.js";
import User from "../models/User.js";

const createNewsService = async (body) => {
  return await News.create(body);
};

const findAllService = (limit, offset) =>
  News.find().sort({ _id: -1 }).skip(offset).limit(limit).populate("user");

const countNews = () => News.countDocuments();

const topNewsService = () => News.findOne().sort({ _id: -1 }).populate("user");

const findByIdService = (id) => News.findById(id);

const findBySearchService = (title, limit, offset) =>
  News.find({
    title: { $regex: `${title || ""}`, $options: "i" }, //expressão regular do mongoDB
  })
    .sort({ _id: -1 })
    .skip(offset)
    .limit(limit)
    .populate("user");

const countNewsFilter = (title) =>
  News.find({
    title: { $regex: `${title || ""}`, $options: "i" }, //expressão regular do mongoDB
  }).countDocuments();

// console.log(countNewsFilter());

const byUserService = (id) =>
  News.find({ user: id }).sort({ _id: -1 }).populate("user");

const upDateService = (id, title, text, banner) =>
  News.findByIdAndUpdate(
    { _id: id },
    { title, text, banner },
    { rawResult: true }
  );

const eraseService = (id) => News.findByIdAndDelete({ _id: id });

const likesNewsService = (idNews, userId) =>
  News.findOneAndUpdate(
    { _id: idNews, "likes.userId": { $nin: [userId] } },
    { $push: { likes: { userId, created: new Date() } } }
  );

const deleteLikesNewsService = (idNews, userId) =>
  News.findOneAndUpdate({ _id: idNews }, { $pull: { likes: { userId } } });

const addCommentService = async (idNews, userId, comment) => {
  try {
    const idComment = Math.floor(Date.now() * Math.random()).toString(36);

    const { name, avatar } = await User.findOne({ _id: userId });

    await News.findOneAndUpdate(
      {
        _id: idNews,
      },
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
      }
    );
    return News.findOne({ _id: idNews });
  } catch (error) {
    console.log(error);
  }
};

const deleteCommentService = (idNews, userId, idComment) =>
  News.findOneAndUpdate(
    { _id: idNews },
    { $pull: { comments: { userId, idComment } } }
  );

export {
  addCommentService,
  byUserService,
  countNews,
  countNewsFilter,
  createNewsService,
  deleteCommentService,
  deleteLikesNewsService,
  eraseService,
  findAllService,
  findByIdService,
  findBySearchService,
  likesNewsService,
  topNewsService,
  upDateService,
};
