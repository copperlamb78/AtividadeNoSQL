import { Router } from "express";
import { createInsumoController, getAllInsumosController, updateInsumoByNameController } from "../controller/insumosController.ts";

export const insumosRoute = Router();

insumosRoute.get("/", getAllInsumosController);

insumosRoute.put('/:nome', updateInsumoByNameController);

insumosRoute.post("/", createInsumoController);