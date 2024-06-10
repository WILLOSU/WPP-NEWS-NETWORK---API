import bcrypt from "bcrypt";
import { loginService, generationToken } from "../services/auth.service.js";

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await loginService(email);

    if (!user) {
      return res.status(404).send({ message: "User or password not found" });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(404).send({ message: "User or password not found" });
    }
    console.log(passwordIsValid);

    delete user.password;

    const _user = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      background: user.background,
    };

    //guardando a sessão do usuário
    const token = generationToken(user.id);

    res.send({ token, user: _user });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { login };
