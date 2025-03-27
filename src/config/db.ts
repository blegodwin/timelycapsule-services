import mongoose from "mongoose";

export const connectToDB = async (connectionString?: string) => {
  try {
    let mongoURI =
      connectionString ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/timelycapsule";

    const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
    console.log("Original connection string:", maskedURI);

    if (mongoURI.includes("db:27017")) {
      mongoURI = "mongodb://localhost:27017/timelycapsule";
      console.log("Using local development connection string");
    }

    const maskedModifiedURI = mongoURI.replace(
      /\/\/([^:]+):([^@]+)@/,
      "//***:***@"
    );
    console.log(
      "Attempting to connect to MongoDB with URI:",
      maskedModifiedURI
    );

    // Adding connection options from your formal config
    await mongoose.connect(mongoURI, {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log("Connected to MongoDB successfully");

    // Adding event handlers from your formal config
    mongoose.connection.on("error", (err) => {
      console.error("Database connection error: ", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Database connection lost. Reconnecting...");
      connectToDB(mongoURI);
    });
  } catch (error) {
    console.error("Error connecting to the database: ", error);
    throw error;
  }
};

export async function disconnectFromDataBase() {
  await mongoose.connection.close();
  console.log("Disconnected from the database");
  return;
}
