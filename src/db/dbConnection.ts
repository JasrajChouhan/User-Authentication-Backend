import mongoose from 'mongoose';
import serverConfigVariable from '../config/serverConfig';

async function dbConnection() {
  const MONGO_DB_URI = serverConfigVariable.MONGO_DB_URI as string;

  if (!MONGO_DB_URI) {
    console.log(`MongoDB URI is not provided in server configuration.gured`);
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_DB_URI);
    console.log(`Successfully connected mongodb uri ${MONGO_DB_URI}`);

    mongoose.connection.on('disconnected', () => {
      console.log(`MongoDB is disconnected!!`);
    });

    mongoose.connection.on('error', error => {
      console.log(`MongoDB connection error`, error);
    });
  } catch (error) {
    console.error('Error while connecting to MongoDB:', error);
    process.exit(1);
  }
}

export default dbConnection;
