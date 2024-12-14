//Importing Express
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/requestRoutes");
const cookieParser = require("cookie-parser");

//Load environment variable
dotenv.config();

//Initialize the Express app
const app = express();

//Define a PORT
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/connection', connectionRoutes)

//Define a simple route
app.get('/',(req,res) => {
    res.send("Welcome to the Express server!");
});

//Start the server
app.listen(PORT, async() => {
    try {
        await connectDB(); // Wait for DB connection
        console.log(`Server is successfully running on PORT ${PORT}`);
    } catch (error) {
        console.error("Database not connected successfully ", error);
        process.exit(1); // Exit if DB connection fails
    }
});