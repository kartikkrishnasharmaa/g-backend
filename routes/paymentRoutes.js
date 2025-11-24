import express from "express";
import { createOrder } from "../controllers/payment/createOrder.js";
import { verifyPayment } from "../controllers/payment/verifyPayment.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-order", requireSignIn, createOrder);
router.post("/verify-payment", requireSignIn, verifyPayment);

export default router;
