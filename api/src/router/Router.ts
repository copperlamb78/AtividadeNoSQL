import { Router } from "express";
import { insumosRoute } from "./insumosRoute.ts";
import { produtosRoute } from "./produtosRoute.ts";
import { pedidoRoute } from "./pedidoRoute.ts";
import { balancoRoute } from "./balancoRoute.ts";

const router = Router();

router.use("/insumos", insumosRoute);

router.use("/produtos", produtosRoute);

router.use("/pedidos", pedidoRoute);

router.use("/balanco", balancoRoute);

export default router;
