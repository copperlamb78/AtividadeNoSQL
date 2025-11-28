import { Router } from "express";
import {
  cancelPedidoByIdController,
  createPedidoController,
  deletePedidoByIdController,
  deliverPedidoByIdController,
  getAllPedidosOrByIdController,
} from "../controller/pedidoController.ts";

export const pedidoRoute = Router();

pedidoRoute.post("/", createPedidoController);

pedidoRoute.get("/", getAllPedidosOrByIdController);
pedidoRoute.get("/:id", getAllPedidosOrByIdController);

pedidoRoute.put("/:id/deliver", deliverPedidoByIdController);

pedidoRoute.delete("/:id", deletePedidoByIdController);

pedidoRoute.delete("/:id/cancel", cancelPedidoByIdController);
