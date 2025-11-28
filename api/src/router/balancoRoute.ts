import { Router } from "express";
import { getBalancoMensalController } from "../controller/balancoController.ts";

export const balancoRoute = Router();

balancoRoute.get("/mensal", getBalancoMensalController);
