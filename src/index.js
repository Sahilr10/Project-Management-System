import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 3000;

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running at port ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("Mongo db connection failed",err);
    process.exit(1);
})