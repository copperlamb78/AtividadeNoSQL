import { Router } from "express";
import { createProdutoController } from "../controller/produtosController.ts";

export const produtosRoute = Router();

produtosRoute.post("/", createProdutoController)