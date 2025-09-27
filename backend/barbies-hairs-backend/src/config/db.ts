// const url = process.env.DATABASE;

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.DATABASE || "", {
//       dbName: "barbies-hairs",
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host} 🌟⭐✨💫`);
//     return conn;
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     process.exit(1);
//   }
// };

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE || '', {
      dbName: 'barbies-hairs',
    });

    console.log(`MongoDB Connected to DB: ${conn.connection.name} 🌟⭐✨💫`);
    return conn;
  } catch (error) {
    if (error instanceof Error) {
      console.error('MongoDB connection error:', error.message);
    } else {
      console.error('Unknown MongoDB connection error:', error);
    }
    process.exit(1);
  }
};

export default connectDB;

// const connectDB = async () => {
//   try {
//     const uri = process.env.DATABASE;
//     if (!uri) throw new Error('Missing MONGO_URI in .env file');

//     const conn = await mongoose.connect(uri, {
//       dbName: 'barbies-hairs',
//     });

//     console.log(`✅ MongoDB Connected: ${conn.connection.name}`);
//     return conn;
//   } catch (error) {
//     console.error(
//       '❌ MongoDB connection error:',
//       error instanceof Error ? error.message : error
//     );
//     process.exit(1);
//   }
// };

// export default connectDB;

// npm start       # or `node dist/server.js`
// npm run seed    # if you're running the seeder
//npm run dev for nodemon starter
