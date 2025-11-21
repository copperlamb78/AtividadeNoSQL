import { Router } from "express";
import { createInsumoController, deleteInsumoByNameController, getAllInsumosOrByNameController, updateInsumoByNameController } from "../controller/insumosController.ts";

export const insumosRoute = Router();

insumosRoute.get("/", getAllInsumosOrByNameController);

insumosRoute.put("/:nome", updateInsumoByNameController);

insumosRoute.delete("/", deleteInsumoByNameController);

insumosRoute.post("/", createInsumoController);
