import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import categoriesRouter from "./categories";
import exchangeRatesRouter from "./exchange-rates";
import adminRouter from "./admin";
import contactRouter from "./contact";

import authRouter from "./auth";
import oauthRouter from "./oauth";
import paymentsRouter from "./payments";
import aiRouter from "./ai";
import configRouter from "./config";
import uploadsRouter from "./uploads";
import partnersRouter from "./partners";
import listingPackagesRouter from "./listing-packages";
import walletRouter from "./wallet";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(configRouter);
router.use(uploadsRouter);
router.use(partnersRouter);
router.use(listingPackagesRouter);
router.use(walletRouter);
router.use(notificationsRouter);
router.use(authRouter);
router.use(oauthRouter);
router.use(paymentsRouter);
router.use(aiRouter);
router.use(contactRouter);
router.use(healthRouter);
router.use(listingsRouter);
router.use(categoriesRouter);
router.use(exchangeRatesRouter);
router.use(adminRouter);

export default router;
