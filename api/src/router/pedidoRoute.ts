import { Router } from "express";
import {
  cancelPedidoByIdController,
  createPedidoController,
  deletePedidoByIdController,
  getAllPedidosOrByIdController,
} from "../controller/pedidoController.ts";

export const pedidoRoute = Router();

pedidoRoute.post("/", createPedidoController);

pedidoRoute.get("/", getAllPedidosOrByIdController);
pedidoRoute.get("/:id", getAllPedidosOrByIdController);

pedidoRoute.delete("/:id", deletePedidoByIdController);

pedidoRoute.delete("/:id/cancel", cancelPedidoByIdController);
