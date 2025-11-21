import { connectDB } from "../db/mongodb.ts";

export async function createInsumoModel(data: { nome: string; quantidade: number; unidade: string; custo: number }) {
  const db = await connectDB();
  const insumosCollection = db.collection("insumos");
  const result = await insumosCollection.insertOne(data);
  return result;
}

export async function getAllInsumosModel() {
  const db = await connectDB();
  const insumosCollection = db.collection("insumos");
  const insumos = await insumosCollection.find().toArray();
  return insumos;
}

export async function getInsumoByNameModel(data: { nome: string }) {
  const db = await connectDB();
  const insumosCollection = db.collection("insumos");
  const insumo = await insumosCollection.find({ nome: data.nome }).toArray();
  return insumo;
}

export async function updateInsumoByNameModel(
  nome: string,
  updates: Partial<{
    nome: string;
    quantidade: number;
    unidade: string;
    custo: number;
  }>
) {
  const db = await connectDB();
  const insumosCollection = db.collection("insumos");
  const insumo = await insumosCollection.updateOne({ nome: nome }, { $set: updates });
  if (insumo.matchedCount === 0) {
    throw new Error("Insumo não encontrado");
  }
  return insumo;
}

export async function deleteInsumoByNameModel(nome: string) {
  const db = await connectDB();
  const insumosCollection = db.collection("insumos");
  const insumoDeletado = await insumosCollection.deleteOne({ nome: nome });
  if (insumoDeletado.deletedCount === 0) {
    throw new Error("Insumo não encontrado");
  }
  return insumoDeletado;
}
