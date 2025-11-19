import { Router } from "express";
import { createInsumoController, getAllInsumosController } from "../controller/insumosController.ts";

export const insumosRoute = Router();

insumosRoute.get("/", getAllInsumosController);

insumosRoute.post("/", createInsumoController);