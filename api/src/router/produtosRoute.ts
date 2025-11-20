import { Router } from "express";
import { createProdutoController, deleteProdutoByNameController, getAllProdutosOrByNameController, updateProdutoByNameController } from "../controller/produtosController.ts";

export const produtosRoute = Router();

produtosRoute.post("/", createProdutoController)

produtosRoute.get("/", getAllProdutosOrByNameController);

produtosRoute.put('/:nome', updateProdutoByNameController);

produtosRoute.delete("/", deleteProdutoByNameController);