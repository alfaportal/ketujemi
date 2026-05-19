import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import categoriesRouter from "./categories";
import exchangeRatesRouter from "./exchange-rates";
import adminRouter from "./admin";
import contactRouter from "./contact";

import authRouter from "./auth";
import paymentsRouter from "./payments";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(authRouter);
router.use(paymentsRouter);
router.use(aiRouter);
router.use(contactRouter);
router.use(healthRouter);
router.use(listingsRouter);
router.use(categoriesRouter);
router.use(exchangeRatesRouter);
router.use(adminRouter);

export default router;
