import crypto from "crypto";
import orderModel from "../../models/orderModel.js";
import mongoose from "mongoose";
import productModel from "../../models/productModel.js";

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, msg: "Invalid Signature" });
    }

    // Save Order
    const orderObject = orderItems.map((p) => ({
      name: p.name,
      image: p.image,
      price: p.price,
      discountPrice: p.discountPrice,
      quantity: p.quantity,
      productId: new mongoose.Types.ObjectId(p.productId),
      seller: new mongoose.Types.ObjectId(p.seller),
    }));

    const order = new orderModel({
      paymentId: razorpay_payment_id,
      products: orderObject,
      buyer: req.user._id,
      shippingInfo: req.body.shippingInfo,
      amount: req.body.amount,
    });

    await order.save();

    // Reduce stocks
    for (const item of orderItems) {
      const product = await productModel.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send("Payment verification failed");
  }
};
