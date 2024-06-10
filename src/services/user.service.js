import User from "../models/User.js";

const createService = (body) => User.create(body);

const findAllService = () => User.find(); // find() função do mongoose para buscar todos os usuários.

const findByIdService = (id) => User.findById(id);

const updateService = (
  id,
  name,
  username,
  email,
  password,
  avatar,
  background
) =>
  User.findOneAndUpdate(
    { _id: id }, //find one
    { name, username, email, password, avatar, background } // and update
  );

export default {
  createService,
  findAllService,
  findByIdService,
  updateService,
};
