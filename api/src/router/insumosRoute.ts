import { Router } from "express";
import { createInsumoController, deleteInsumoByNameController, getAllInsumosController, updateInsumoByNameController } from "../controller/insumosController.ts";

export const insumosRoute = Router();

insumosRoute.get("/", getAllInsumosController);

insumosRoute.put('/:nome', updateInsumoByNameController);

insumosRoute.delete("/", deleteInsumoByNameController);

insumosRoute.post("/", createInsumoController);