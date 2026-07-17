const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dns = require('dns');

let memoryServer;

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  const effectiveUrl = mongoUrl || (await getFallbackMongoUrl());

  if (mongoUrl && mongoUrl.startsWith('mongodb+srv://')) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(effectiveUrl, {
    autoIndex: true
  });

  console.log(mongoUrl ? 'MongoDB Atlas connected' : 'Local demo MongoDB connected');
};

const getFallbackMongoUrl = async () => {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
  }

  return memoryServer.getUri();
};

const closeFallbackMongo = async () => {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = connectDB;
module.exports.closeFallbackMongo = closeFallbackMongo;
