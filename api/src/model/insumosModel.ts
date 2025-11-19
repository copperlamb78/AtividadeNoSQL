import { connectDB } from "../db/mongodb.ts";

export async function createInsumoModel(data: {
    nome: string,
    quantidade: number,
    unidade: string,
    custo: number
}) {
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