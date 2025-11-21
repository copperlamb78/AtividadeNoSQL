import { Router } from "express";
import {
  createProdutoController,
  deleteInsumoInProdutoController,
  deleteProdutoByNameController,
  getAllProdutosOrByNameController,
  updateProdutoByNameController,
} from "../controller/produtosController.ts";

export const produtosRoute = Router();

produtosRoute.post("/", createProdutoController);

produtosRoute.get("/", getAllProdutosOrByNameController);

produtosRoute.put("/:nome", updateProdutoByNameController);

produtosRoute.delete("/", deleteProdutoByNameController);

produtosRoute.delete("/:nome/insumos/:insumo", deleteInsumoInProdutoController);
