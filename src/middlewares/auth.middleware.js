import dotEnv from "dotenv";
import jwt from "jsonwebtoken";
import userService from "../services/user.service.js";
dotEnv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      res.send(403);
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2) {
      return res.send(403);
    }

    const [schema, token] = parts;

    if (schema !== "Bearer") {
      return res.send(403);
    }

    jwt.verify(token, process.env.SECRET_JWT, async (error, decoded) => {
      if (error) {
        return res.status(403).send({ message: "Token Invalid!" });
      }

      const user = await userService.findByIdService(decoded.id);

      if (!user || !user.id) {
        return res.status(403).send({ message: "Token Invalid!" });
      }

      req.userId = user.id;
      return next();
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
