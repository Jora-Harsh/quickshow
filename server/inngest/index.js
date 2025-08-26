import { Inngest } from "inngest";
import mongoose from "mongoose";
import User from "../models/User.js";

/* ---------- DB connection (cached) ---------- */
let isConnected = false;
mongoose.set("bufferCommands", false);

export const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "quickshow",
    serverSelectionTimeoutMS: 10000, // fail fast instead of hanging
    maxPoolSize: 5,
  });
  isConnected = true;
  console.log("MongoDB connected:", mongoose.connection.name);
};

/* ---------- Inngest client ---------- */
export const inngest = new Inngest({ id: "movie-ticket-booking" });

/* ---------- helpers ---------- */
const getPrimaryEmail = (data) => {
  const arr = data?.email_addresses || [];
  const primaryId = data?.primary_email_address_id;
  const primary = arr.find(e => e.id === primaryId) || arr[0];
  return primary?.email_address || null;
};

/* ---------- functions ---------- */

// create / upsert user
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, image_url } = event.data || {};
    const email = getPrimaryEmail(event.data);

    const userData = {
      _id: id,
      email,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    };

    // upsert avoids duplicate key errors on retries/replays
    const doc = await User.findByIdAndUpdate(id, userData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    return { ok: true, userId: doc._id }; // <- lets Inngest mark Completed
  }
);

// delete user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data || {};
    await User.findByIdAndDelete(id);
    return { ok: true, deleted: id };
  }
);

// update user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, image_url } = event.data || {};
    const email = getPrimaryEmail(event.data);

    const userData = {
      _id: id,
      email,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    };

    const doc = await User.findByIdAndUpdate(id, userData, { new: true, upsert: true });
    return { ok: true, updated: doc?._id || id };
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
