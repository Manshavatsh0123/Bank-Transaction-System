const mongoose = require("mongoose");

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Server is connected to DB!");

    } catch (err) {
        console.log("Error connecting to DB!", err.message);
        process.exit(1);
    }
}

module.exports = connectToDB;