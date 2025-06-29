import {
  addCommentService,
  byUserService,
  countNews,
  countNewsFilter,
  createNewsService,
  deleteCommentService,
  deleteLikesNewsService,
  findAllService,
  findByIdService,
  findBySearchService,
  likesNewsService,
  topNewsService,
  upDateService,
  moderateNewsService,
  deactivateNewsService,
  hardDeleteNewsService,
} from "../services/news.service.js";

import userService from "../services/user.service.js"; // Importado para buscar userLogado

const create = async (req, res) => {
  try {
    const { title, text, banner } = req.body;
    if (!title || !text) {
      return res.status(400).send({
        message: "Por favor, envie o título e o texto para registro.",
      });
    }

    const createdAt = new Date();
    const userId = req.userId;

    const userLogado = await userService.findByIdService(userId);
    const newsStatus =
      userLogado && userLogado.role === "admin" ? "published" : "pending";

    const newsData = {
      title,
      text,
      banner,
      createdAt,
      user: userId,
      likes: [],
      comments: [],
      status: newsStatus,
    };

    const news = await createNewsService(newsData);

    if (!news) {
      return res.status(400).send({ message: "Erro ao criar notícia." });
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
    });
  } catch (error) {
    console.error(error);
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

    const news = await findAllService(limit, offset, { status: "published" });

    const total = await countNews({ status: "published" });
    const currentUrl = req.baseUrl;

    const next = offset + limit;
    const nextUrl =
      next < total ? `${currentUrl}?limit=${limit}&offset=${next}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous !== null
        ? `${currentUrl}?limit=${limit}&offset=${previous}`
        : null;

    if (news.length === 0) {
      return res.status(200).send({
        results: [],
        message: "Não há notícias publicadas no momento.",
      });
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const topNews = async (req, res) => {
  try {
    const news = await topNewsService({ status: "published" });

    if (!news) {
      return res
        .status(404)
        .send({ message: "Não há notícias principais registradas." });
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await findByIdService(id);

    const userLogado = req.user;
    if (
      news.status !== "published" &&
      (!userLogado || news.user._id.toString() !== userLogado._id.toString())
    ) {
      if (!userLogado || userLogado.role !== "admin") {
        return res.status(403).send({
          message:
            "Acesso negado. Esta notícia não está publicada ou você não tem permissão para vê-la.",
        });
      }
    }

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
        status: news.status,
      },
    });
  } catch (error) {
    console.error(error);
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

    const total = await countNewsFilter(title, { status: "published" });
    const news = await findBySearchService(title, limit, offset, {
      status: "published",
    });

    const currentUrl = req.baseUrl;

    const next = offset + limit;
    const nextUrl =
      next < total ? `${currentUrl}?limit=${limit}&offset=${next}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous !== null
        ? `${currentUrl}?limit=${limit}&offset=${previous}`
        : null;

    if (news.length === 0) {
      return res.status(200).send({
        results: [],
        message: "Nenhuma notícia encontrada com o título pesquisado.",
      });
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
        status: item.status,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const byUser = async (req, res) => {
  try {
    const id = req.userId;

    const news = await byUserService(id, {});

    if (news.length === 0) {
      return res
        .status(200)
        .send({ results: [], message: "Este usuário não possui notícias." });
    }

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
        status: item.status,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const upDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, banner, status } = req.body;

    if (!title && !text && !banner && !status) {
      return res.status(400).send({
        message: "Por favor, envie pelo menos um campo para atualizar a notícia.",
      });
    }

    const news = await findByIdService(id);

    if (!news) {
      return res.status(404).send({ message: "Notícia não encontrada." });
    }

    const userIdLogado = req.userId;

    const userLogado = await userService.findByIdService(userIdLogado);
    if (!userLogado) {
      return res.status(404).send({ message: "Usuário logado não encontrado para verificação de permissão." });
    }

    if (
      news.user._id.toString() !== userIdLogado.toString() &&
      userLogado.role !== "admin"
    ) {
      return res.status(403).send({
        message: "Acesso negado. Você não tem permissão para atualizar esta notícia.",
      });
    }

    const updateData = { title, text, banner };
    if (userLogado.role === "admin" && status) {
      updateData.status = status;
    } else if (userLogado.role === "common" && status) {
      return res.status(403).send({
        message: "Acesso negado. Usuários comuns não podem alterar o status da notícia.",
      });
    }

    await upDateService(id, updateData);

    return res.status(200).send({ message: "Notícia atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const erase = async (req, res) => {
  try {
    const { id } = req.params;
    const userIdLogado = req.userId;
    const userLogado = await userService.findByIdService(userIdLogado); // Busca o user logado para permissão

    if (!userLogado) {
      return res.status(404).send({ message: "Usuário logado não encontrado para verificação de permissão." });
    }

    const news = await findByIdService(id);

    if (!news) {
      return res.status(404).send({ message: "Notícia não encontrada." });
    }

    if (
      news.user._id.toString() !== userIdLogado.toString() &&
      userLogado.role !== "admin"
    ) {
      return res
        .status(403)
        .send({
          message:
            "Acesso negado. Você não tem permissão para desativar esta notícia.",
        });
    }

    await deactivateNewsService(id);

    return res.status(200).send({ message: "Notícia inativada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const moderateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "published", "rejected"].includes(status)) {
      return res.status(400).send({ message: "Status inválido fornecido." });
    }

    const userIdLogado = req.userId; // Obter userId do token
    const userLogado = await userService.findByIdService(userIdLogado); // Buscar user completo para o role

    if (!userLogado || userLogado.role !== "admin") {
      return res
        .status(403)
        .send({
          message: "Acesso negado. Somente administradores podem moderar notícias.",
        });
    }

    const news = await findByIdService(id);
    if (!news) {
      return res.status(404).send({ message: "Notícia não encontrada." });
    }

    await moderateNewsService(id, status);

    res
      .status(200)
      .send({ message: `Notícia atualizada para status: ${status}.` });
  } catch (error) {
    console.error("Erro ao moderar notícia:", error);
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
        .send({ userId, message: "Like removido com sucesso!" });
    }

    res.send({ userId, message: "Like realizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { comment } = req.body;

    if (!comment) {
      return res
        .status(400)
        .send({ message: "Por favor, escreva uma mensagem para comentar." });
    }

    const newsUpdated = await addCommentService(id, userId, comment);

    res.status(200).send({
      commentCreated: newsUpdated.comments.at(-1),
      message: "Comentário adicionado com sucesso!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { idNews, idComment } = req.params;
    const userId = req.userId;

    const news = await findByIdService(idNews);
    if (!news) {
      return res.status(404).send({ message: "Notícia não encontrada." });
    }

    const commentToDelete = news.comments.find(
      (comment) => comment._id.toString() === idComment.toString()
    );

    if (!commentToDelete) {
      return res.status(404).send({ message: "Comentário não encontrado." });
    }

    const userLogado = await userService.findByIdService(userId); // Buscar o user logado para permissão
    if (!userLogado) {
      return res.status(404).send({ message: "Usuário logado não encontrado para verificação de permissão." });
    }

    if (
      commentToDelete.userId.toString() !== userId.toString() &&
      userLogado.role !== "admin"
    ) {
      return res.status(403).send({
        message: "Acesso negado. Você não pode remover este comentário.",
      });
    }

    await deleteCommentService(idNews, idComment);

    res.status(200).send({ message: "Comentário removido com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};


const hardDeleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    //APENAS ADMIN PODE FAZER HARD DELETE ---
    const userIdLogado = req.userId;
    const userLogado = await userService.findByIdService(userIdLogado);
    if (!userLogado || userLogado.role !== 'admin') {
      return res.status(403).send({ message: 'Acesso negado. Somente administradores podem excluir notícias permanentemente.' });
    }
   

    const newsToDelete = await findByIdService(id); 
    if (!newsToDelete) {
      return res.status(404).send({ message: "Notícia não encontrada para exclusão permanente." });
    }

    await hardDeleteNewsService(id); 

    res.status(200).send({ message: "Notícia excluída permanentemente com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir notícia permanentemente:", error);
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
  moderateNews,
  hardDeleteNews,
};