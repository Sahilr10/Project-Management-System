import express from "express";
import cors from "cors";

const app = express();

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));

//cors configurations
app.use(cors({
    origin : process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders : ["Content-Type", "Authorization"]
}));

//import routes
import healthcheckRouter from './routes/healthcheck.routes.js';

//use routes
app.use('/api/v1/healthcheck', healthcheckRouter);

export default app;