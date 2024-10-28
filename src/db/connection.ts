import mongoose from 'mongoose';

const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error('MONGO_URL is not defined in the environment variables');
    }

    const con = await mongoose.connect(mongoUrl);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

export default connectMongoDB;
