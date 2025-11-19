import { Router } from "express";
import { insumosRoute } from "./insumosRoute.ts";

const router = Router();

router.use("/insumos", insumosRoute)

export default router;
