import { ObjectId } from "mongodb";
import { connectDB } from "../db/mongodb.ts";

export async function createPedidoModel(
  produtos: Array<{ nome: string; quantidade: number }>,
  insumosUsados: Array<{ nome: string; quantidade: number; custo: number }>,
  ReceitaTotal: number,
  data: string
) {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedidoAdicionado = await pedidoCollection.insertOne({
    produtos,
    insumosUsados,
    ReceitaTotal,
    data,
    status: "Pendente",
  });
  return pedidoAdicionado;
}

export async function getAllPedidosModel() {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedidos = await pedidoCollection.find().toArray();
  return pedidos;
}

export async function getPedidoByNameModel(id: string) {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedido = await pedidoCollection.find({ _id: new ObjectId(id) }).toArray();
  return pedido;
}

export async function deletePedidoByIdModel(id: string) {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedidoDeletado = await pedidoCollection.deleteOne({ _id: new ObjectId(id) });
  return pedidoDeletado;
}

export async function getPedidoByIdModel(id: string) {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedido = await pedidoCollection.findOne({ _id: new ObjectId(id) });
  return pedido;
}

export async function cancelPedidoByIdModel(id: string) {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedidoCancelado = await pedidoCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "Cancelado" } }
  );
  return pedidoCancelado;
}

export async function deliverPedidoByIdModel(id: string) {
  const db = await connectDB();
  const pedidoCollection = db.collection("pedidos");
  const pedidoEntregue = await pedidoCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status: "Entregue" } });
  return pedidoEntregue;
}
