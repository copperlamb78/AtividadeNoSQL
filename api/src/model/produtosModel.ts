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

export async function getAllProdutosModel() {
    const db = await connectDB();
    const produtosCollection = db.collection("produtos");
    const produtos = await produtosCollection.find().toArray();
    return produtos;
}

export async function getProdutoByNameModel(data: {
    nome: string
}) {
    const db = await connectDB()
    const produtosCollection = db.collection("produtos")
    const produto = await produtosCollection.find({ nome: data.nome}).toArray()
    return produto
}

export async function updateProdutoByNameModel(nome: string, updates: Partial<{
    nome: string,
    preco: number,
    insumos: Array<{
        nome: string,
        quantidade: number
    }>
}>) {
    const db = await connectDB()
    const produtosCollection = db.collection("produtos")
    const produto = await produtosCollection.updateOne(
        { nome: nome },
        { $set: updates }
    )
    if (produto.matchedCount === 0) {
        throw new Error("Produto não encontrado")
    }
    return produto
}

export async function deleteProdutoByNameModel(nome: string) {
    const db = await connectDB()
    const produtosCollection = db.collection("produtos")
    const produtoDeletado = await produtosCollection.deleteOne({ nome: nome })
    if (produtoDeletado.deletedCount === 0) {
        throw new Error("Produto não encontrado")
    }
    return produtoDeletado
}