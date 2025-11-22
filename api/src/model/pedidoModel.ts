import { connectDB } from "../db/mongodb.ts";

export async function createPedidoModel(
  produtos: Array<{ nome: string; quantidade: number }>,
  insumosUsados: Array<{ nome: string; quantidade: number }>,
  ReceitaTotal: number,
  data: string
) {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedidoAdicionado = await pedidoCollection.insertOne({ produtos, insumosUsados, ReceitaTotal, data });
  return pedidoAdicionado;
}
