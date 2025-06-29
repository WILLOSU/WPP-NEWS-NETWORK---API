import User from "../models/User.js";

const createService = (body) => User.create(body);

const findAllService = () => User.find({ isActive: true });

const findByIdService = (id) => User.findById(id);

const updateService = (id, data) =>
  User.findOneAndUpdate({ _id: id }, data, { new: true });

const deactivateService = (id) =>
  User.findOneAndUpdate({ _id: id }, { isActive: false });

export default {
  createService,
  findAllService,
  findByIdService,
  updateService,
  deactivateService,
};
