import { razorpayInstance } from "../../config/razorpay.js";

export const createOrder = async (req, res) => {
  RAZORPAY_KEY_ID = "rzp_test_RpwQkcCliamBnr"
  
  try {
    const { products } = req.body;

    // Calculate amount
    const totalAmount = products.reduce(
      (acc, item) => acc + item.discountPrice * item.quantity,
      0
    );

    const options = {
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      receipt: "receipt_order_" + Math.random().toString(36).substr(2, 9),
    };

    const order = await razorpayInstance.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      amount: totalAmount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error creating Razorpay order");
  }
};
