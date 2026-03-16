import Stripe from "stripe";
import connectDB from "../lib/db.js";
import User from "../models/user.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req,res){

await connectDB();

const event = req.body;

if(event.type === "checkout.session.completed"){

const session = event.data.object;

const userId = session.metadata.userId;
const credits = Number(session.metadata.credits);

const user = await User.findById(userId);

user.credits += credits;

await user.save();

}

res.json({received:true});

}