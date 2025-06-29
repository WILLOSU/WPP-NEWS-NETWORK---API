
import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'published', 'rejected', 'inactive'], 
    default: 'pending',                      
    required: true,
  },

  likes: {
    type: Array,
    required: true,
  },
  comments: {
    type: Array,
    required: true,
  },
});

const News = mongoose.model("News", NewsSchema);

export default News;