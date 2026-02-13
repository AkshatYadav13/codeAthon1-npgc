import "dotenv/config";
import mongoose from "mongoose";
import dns from "node:dns/promises";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dropIndex = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
        console.log("Connected.");

        const collections = await mongoose.connection.db.listCollections().toArray();
        const usersCollection = collections.find(c => c.name === 'users');

        if (usersCollection) {
            console.log("Dropping 'email_1' index from 'users' collection...");
            await mongoose.connection.db.collection('users').dropIndex('email_1');
            console.log("Index dropped successfully.");
        } else {
            console.log("'users' collection not found.");
        }

    } catch (error) {
        console.error("Error dropping index:", error.message);
        if (error.codeName === 'IndexNotFound') {
            console.log("The index 'email_1' does not exist. It might have been dropped already.");
        }
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
};

dropIndex();
