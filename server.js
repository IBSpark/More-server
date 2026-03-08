import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://more-client.vercel.app",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(cors({
//   origin: "*"
// }));
app.use(express.json());

let isConnected = false;


async function connectToMongoDB() {
  try {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:true,
    useUnifiedTopology:true
  });
  isConnected = true;
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Error connecting to MongoDB:" , error);
}
}

// add  middleware

app.use((req , res ,next) => {
  if (!isConnected){
    connectToMongoDB();

  }
  next();
})



// Local routing for Vercel‑style API
app.use("/api/auth/register", (req, res) =>
  import("./api/auth/register.js").then((mod) => mod.default(req, res))
);
app.use("/api/auth/login", (req, res) =>
  import("./api/auth/login.js").then((mod) => mod.default(req, res))
);

app.use("/api/auth/google", (req, res) =>
  import("./api/auth/google.js").then((mod) => mod.default(req, res))
);
app.use("/api/update", (req, res) =>
  import("./api/update.js").then((mod) => mod.default(req, res))
);
app.use("/api/auth/about", (req, res) =>
  import("./api/auth/about.js").then((mod) => mod.default(req, res))
);

app.use("/api/generate", (req, res) =>
  import("./api/generate.js").then((mod) => mod.default(req, res))
);

app.use("/api/voices", (req, res) =>
  import("./api/voices.js").then((mod) => mod.default(req, res))
);

app.use("/api/credits", (req, res) =>
  import("./api/credits.js").then((mod) => mod.default(req, res))
);

app.use("/api/history", (req, res) =>
  import("./api/history.js").then((mod) => mod.default(req, res))
);

app.get('/',(req,res)=>{
    res.send({
        activeStatus: true, 
        error: false,
        
    })
})

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Local server running at http://localhost:${PORT}`);
// });

// do not use app.listen() in vercel
export default app;

