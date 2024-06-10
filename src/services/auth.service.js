import jwt from "jsonwebtoken";
import User from "../models/User.js";

const loginService = (email) =>
  User.findOne({ email: email }).select("+password");

const expiresInThreeDays = 3 * 24 * 60 * 60; // 3 dias

const generationToken = (id) =>
  jwt.sign({ id: id }, process.env.SECRET_JWT, {
    expiresIn: expiresInThreeDays,
  });

export { generationToken, loginService };
