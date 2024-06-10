import {
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
} from "../services/news.service.js";

const create = async (req, res) => {
  try {
    const { title, text, banner } = req.body;
    if (!title || !text) {
      res
        .status(400)
        .send({ message: "Submit title and text for registration" });
    }

    const createdAt = new Date();
    await createNewsService(
      {
        title,
        text,
        banner,
        createdAt,
        user: { _id: req.userId },
      },
      createdAt
    );

    res.status(200).send({
      message: "News created",
      title,
      text,
      banner,
      createdAt,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const findAll = async (req, res) => {
  try {
    let { limit, offset } = req.query;

    limit = Number(limit);
    offset = Number(offset);

    if (!limit) {
      limit = 5;
    }

    if (!offset) {
      offset = 0;
    }

    // Paginations
    const news = await findAllService(limit, offset);

    const total = await countNews();
    const currentUrl = req.baseUrl;

    const next = offset - limit;
    const nextUrl =
      next < total ? `${currentUrl}?limit=${limit}&offset=${offset}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous != null ? `${currentUrl}?limit=${limit}&offset=${offset}` : null;

    if (news.length === 0) {
      res.send({ message: "There are no registered news" });
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
      })),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const topNews = async (req, res) => {
  try {
    const news = await topNewsService();

    if (!news) {
      return res.send({ message: "There is no registered news" });
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
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const findById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log({ id });

    const news = await findByIdService(id);
    return res.send({
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
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const findBySearch = async (req, res) => {
  try {
    let { title, limit, offset } = req.query;

    limit = Number(limit);
    offset = Number(offset);

    if (!limit) {
      limit = 0;
    }

    if (!offset) {
      offset = 0;
    }

    const total = await countNewsFilter(title);
    const news = await findBySearchService(title, limit, offset);

    const currentUrl = req.baseUrl;

    const next = offset - limit;
    const nextUrl =
      next < total ? `${currentUrl}?limit=${limit}&offset=${offset}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous != null ? `${currentUrl}?limit=${limit}&offset=${offset}` : null;

    if (news.length === 0) {
      return res.status(400).send({ results: [] });
    }

    res.send({
      nextUrl,
      previousUrl,
      total,
      limit,
      offset,
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
      })),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const byUser = async (req, res) => {
  try {
    const id = req.userId;
    const news = await byUserService(id);

    return res.send({
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
      })),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const upDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, banner } = req.body;

    if (!title && !text && !banner) {
      res
        .status(400)
        .send({ message: "Submit at least one field for update the post" });
    }

    const news = await findByIdService(id);

    if (news.user._id != req.userId) {
      return res.status(400).send({ message: "You didn't update this post" });
    }

    await upDateService(id, title, text, banner);

    return res.send({ message: "News successfully updated!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const erase = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await findByIdService(id);

    if (news.user._id != req.userId) {
      res.status(500).send({ message: "You didn't delete this news" });
    }

    await eraseService(id);
    return res.send({ message: "news deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const likesNews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const newsLiked = await likesNewsService(id, userId);

    if (!newsLiked) {
      await deleteLikesNewsService(id, userId);

      return res
        .status(200)
        .send({ userId, message: "Like successfully removed" });
    }

    res.send({ userId, message: "Like done successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).send({ message: "write a message to comment" });
    }

    const newsUpdated = await addCommentService(id, userId, comment);

    res.send({
      commentCreated: newsUpdated.comments.at(-1),
      message: "Comments done successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { idNews, idComment } = req.params;
    const userId = req.userId;

    const deletedComment = await deleteCommentService(
      idNews,
      userId,
      idComment
    );

    const findComment = deletedComment.comments.find(
      (comment) => comment.idComment === idComment
    );

    if (!findComment) {
      res.status(404).send({ message: "Comment not found" });
    }

    if (findComment.userId !== userId) {
      res.status(400).send({ message: "You can't remove this comment" });
    }

    res.send({ message: "Comments successfully removed" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export {
  addComment,
  byUser,
  create,
  deleteComment,
  erase,
  findAll,
  findById,
  findBySearch,
  likesNews,
  topNews,
  upDate,
};
