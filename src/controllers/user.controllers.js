import userService from "../services/user.service.js";

const create = async (req, res) => {
  try {
    const { name, username, email, password, avatar, background } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).send({ message: "Por favor, preencha todos os campos obrigatórios para o registro." });
    }

    const user = await userService.createService(req.body); // serviço de usuário onde está sendo criado o user.

    if (!user) {
      return res.status(400).send({ message: "Erro ao criar usuário." });
    }

    res.status(201).send({
      message: "Usuário criado com sucesso!",
      user: {
        id: user._id,
        name,
        username,
        email,
        avatar,
        background,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) { // Erro de duplicidade do MongoDB
      return res.status(409).send({ message: "Email ou nome de usuário já cadastrado." });
    }
    res.status(500).send({ message: error.message });
  }
};

const findAll = async (req, res) => {
  try {
    const users = await userService.findAllService();

    if (users.length === 0) {
       return res.status(400).send({ message: "Não há usuários registrados." });
    }

    res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const findUserById = async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, username, email, password, avatar, background, role } = req.body;

    if (!name && !username && !email && !password && !avatar && !background && !role) { // Incluído 'role' na validação
      return res.status(400).send({ message: "Por favor, envie pelo menos um campo para atualização." });
    }

    const { id } = req.params;        // ID do usuário que está sendo atualizado (da URL)
    const userIdLogado = req.userId; // ID do usuário logado (do token JWT)
    const userLogadoRole = req.user.role; // Papel do usuário logado (do middleware authRole)

        // O usuário logado só pode atualizar seu próprio perfil, a menos que seja um ADMIN.
    if (id !== userIdLogado && userLogadoRole !== 'admin') {
      return res.status(403).send({ message: 'Acesso negado. Você não tem permissão para atualizar este usuário.' });
    }

        const updateData = { name, username, email, password, avatar, background };
    if (userLogadoRole === 'admin' && role) { // Somente admin pode alterar o papel
        updateData.role = role;
    }

    await userService.updateService(id, updateData); // Ajustamos o service para receber um objeto

    res.send({ message: "Usuário atualizado com sucesso!" });
  } catch (error) {
    // Melhorar a tratativa de erro para emails/usernames duplicados
    if (error.code === 11000) { // Erro de duplicidade do MongoDB
      return res.status(409).send({ message: "Email ou nome de usuário já cadastrado." });
    }
    res.status(500).send({ message: error.message });
  }
};




const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; 
    const userIdLogado = req.userId; 

     console.log("DEBUG: userIdLogado do req.userId:", userIdLogado);
    const userLogado = await userService.findByIdService(userIdLogado);

    console.log("DEBUG: userLogado encontrado pelo service:", userLogado)
    
    if (!userLogado) { 
      console.log("DEBUG: userLogado é nulo/undefined, retornando 404.");
        return res.status(404).send({ message: "Usuário logado não encontrado." });
    }
    
    const userToDeactivate = await userService.findByIdService(id);
    if (!userToDeactivate) {
        return res.status(404).send({ message: "Usuário a ser desativado não encontrado." });
    }

    
    if (id !== userIdLogado && userLogado.role !== 'admin') {
      return res.status(403).send({ message: 'Acesso negado. Você não tem permissão para desativar este usuário.' });
    }

    
    await userService.deactivateService(id); 

    res.status(200).send({ message: "Usuário desativado com sucesso!" });
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    res.status(500).send({ message: error.message });
  }
};




export default { create, findAll, findUserById, update, deleteUser};