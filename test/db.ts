import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

export const connect = async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: "jest-test",
      port: 27018, // Use different port to avoid conflicts
    },
    binary: {
      version: "6.0.8", // Specify MongoDB version for consistency
    },
  });

  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    waitQueueTimeoutMS: 10000,
    maxPoolSize: 10,
  });
};

export const disconnect = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};
