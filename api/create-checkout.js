import Stripe from "stripe";
import jwt from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).end();
}

const token = req.headers.authorization;

const decoded = jwt.verify(
token.replace("Bearer ",""),
process.env.JWT_SECRET
);

const { plan } = req.body;

let price = 500;
let credits = 1000;

if(plan === "pro"){
price = 1500;
credits = 5000;
}

if(plan === "business"){
price = 4000;
credits = 20000;
}

const session = await stripe.checkout.sessions.create({

payment_method_types: ["card"],

mode: "payment",

line_items: [{
price_data:{
currency:"usd",
product_data:{
name:`AI Voice Credits (${credits})`
},
unit_amount: price
},
quantity:1
}],

success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,

cancel_url: `${process.env.CLIENT_URL}/pricing`,

metadata:{
userId: decoded.id,
credits
}

});

res.json({ url: session.url });

}