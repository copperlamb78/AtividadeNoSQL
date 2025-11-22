import { Router } from "express";
import { createPedidoController } from "../controller/pedidoController.ts";

export const pedidoRoute = Router();

pedidoRoute.post("/", createPedidoController);
