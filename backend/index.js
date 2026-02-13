import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";
import dns from "node:dns/promises";
import userRoute from './routes/user.route.js'
import venderRoute from './routes/vender.route.js'
import orderRoute from './routes/order.route.js'
import customerRoute from './routes/customer.route.js'
import dishRoute from './routes/dish.route.js'

dns.setServers(["1.1.1.1"]);

connectDB();


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/user',userRoute)
app.use('/api/v1/vender',venderRoute)
app.use('/api/v1/order',orderRoute)
app.use('/api/v1/customer',customerRoute)
app.use('/api/v1/dish',dishRoute)

app.get("/", (req, res) => {
    res.send("Server is running");
});

import { globalErrorHandler } from "./middlewares.js";
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
