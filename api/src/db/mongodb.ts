import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DB_LINK || "";

const client = new MongoClient(uri);

export async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB conectado!");

    return client.db("minha_base"); // nome da base
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
    throw err;
  }
}
