import { connectDB } from "../db/mongodb.ts";

export async function createEntradaModel(data: {
  insumos: Array<{ nome: string; quantidade: number; custo?: number }>;
  valorTotal?: number;
  data: string;
  origem?: string;
}) {
  const db = await connectDB();
  const entradasCollection = db.collection("entradas");
  const result = await entradasCollection.insertOne(data);
  return result;
}

export async function getAllEntradasModel() {
  const db = await connectDB();
  const entradasCollection = db.collection("entradas");
  const entradas = await entradasCollection.find().toArray();
  return entradas;
}

export async function getEntradasByMonthYear(month: number, year: number) {
  const db = await connectDB();
  const entradasCollection = db.collection("entradas");
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const entradas = await entradasCollection
    .find({ data: { $gte: start.toISOString(), $lt: end.toISOString() } })
    .toArray();
  return entradas;
}
