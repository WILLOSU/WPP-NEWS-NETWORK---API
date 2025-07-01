import bcrypt from "bcrypt"
import { loginService, generationToken } from "../services/auth.service.js"

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await loginService(email)

    // LOGS PARA DEBUG - INÍCIO
    console.log("=== DEBUG LOGIN ===")
    console.log("DEBUG - user do loginService:", user)
    console.log("DEBUG - user.role do loginService:", user?.role)
    console.log("DEBUG - user completo:", JSON.stringify(user, null, 2))
    // LOGS PARA DEBUG - FIM

    if (!user) {
      return res.status(400).send({ message: "Usuário ou senha não encontrado" })
    }

    const passwordIsValid = await bcrypt.compare(password, user.password)

    if (!passwordIsValid) {
      return res.status(400).send({ message: "Usuário ou senha não encontrado" })
    }

    delete user.password

    const _user = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      background: user.background,
      role: user.role,
      isActive: user.isActive,
    }

    // LOGS PARA DEBUG - INÍCIO
    console.log("DEBUG - _user que será retornado:", _user)
    console.log("DEBUG - _user.role:", _user.role)
    // LOGS PARA DEBUG - FIM

    const token = generationToken(user.id)

    const response = { token, user: _user }

    // LOGS PARA DEBUG - INÍCIO
    console.log("DEBUG - response final:", response)
    console.log("DEBUG - response.user.role:", response.user.role)
    console.log("=== FIM DEBUG LOGIN ===")
    // LOGS PARA DEBUG - FIM

    res.status(200).send(response)
  } catch (error) {
    console.error("ERRO no login:", error)
    res.status(500).send(error.message)
  }
}

export { login }
