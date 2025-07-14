// seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js"; // adjust path as needed

dotenv.config(); // to load MONGODB_URI from .env

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existing = await Admin.findOne({ username: "admin@stufit.in" });
    if (existing) {
      console.log("Admin already exists.");
      return process.exit(0);
    }

    const admin = new Admin({
      username: "",
      password: "admin123", // will be hashed automatically by pre-save hook
    });

    await admin.save();
    console.log("✅ Admin user created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
