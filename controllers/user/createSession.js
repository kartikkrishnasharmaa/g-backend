
import stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

const createSession = async (req, res) => {
  try {
    const { products, frontendURL, customerEmail } = req.body;

    const session = await stripeInstance.checkout.sessions.create({
      line_items: products.map((item) => ({
        price_data: {
          currency: "inr",
          unit_amount: item.discountPrice * 100,
          product_data: {
            name: item.name,
          },
        },
        quantity: item.quantity,
      })),

      mode: "payment",

      success_url: `${frontendURL}/shipping/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendURL}/shipping/failed`,

      customer_email: customerEmail,

      shipping_address_collection: {
        allowed_countries: ["IN"],
      },

      phone_number_collection: {
        enabled: true,
      },
    });

    // 🔥 FIX: Return complete session so frontend can use session.id
    return res.status(200).json({
      success: true,
      session: session,
    });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return res.status(500).send("Error in Payment Gateway");
  }
};

export default createSession;
