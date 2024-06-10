import mongoose from "mongoose";

const connectDatabase = () => {
  console.log("wait conecting to the database");

// Defina a opção strictQuery para evitar o aviso de depreciação
mongoose.set('strictQuery', false); // ou true, dependendo da sua preferência

  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log(error));
};

export default connectDatabase;
