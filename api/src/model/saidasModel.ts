import { connectDB } from "../db/mongodb.ts";

export async function createSaidaModel(data: {
  insumos: Array<{ nome: string; quantidade: number; custo?: number }>;
  valorTotal?: number;
  motivo?: string;
  data: string;
}) {
  const db = await connectDB();
  const saidasCollection = db.collection("saidas");
  const result = await saidasCollection.insertOne(data);
  return result;
}

export async function getAllSaidasModel() {
  const db = await connectDB();
  const saidasCollection = db.collection("saidas");
  const saidas = await saidasCollection.find().toArray();
  return saidas;
}

export async function getSaidasByMonthYear(month: number, year: number) {
  const db = await connectDB();
  const saidasCollection = db.collection("saidas");
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const saidas = await saidasCollection.find({ data: { $gte: start.toISOString(), $lt: end.toISOString() } }).toArray();
  return saidas;
}
