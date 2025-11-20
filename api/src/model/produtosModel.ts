import { connectDB } from "../db/mongodb.ts";

export async function createProdutosModel(data: {
    nome: string,
    preco: number,
    insumos: Array<{
        nome: string,
        quantidade: number
    }>
}) {
    const db = await connectDB();
    const produtosCollection = db.collection("produtos");
    const produtoAdicionado = await produtosCollection.insertOne(data);
    return produtoAdicionado;
}