import { Inngest } from "inngest";
import mongoose from "mongoose";
import User from "../models/User.js";

/* --- DB --- */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // already connected
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "quickshow" });
};

/* --- Inngest client --- */
export const inngest = new Inngest({ id: "movie-ticket-booking" });

/* --- tiny helper --- */
const saveUser = async (data) => {
  const { id, first_name, last_name, image_url } = data;
  const email = data.email_addresses?.[0]?.email_address ?? null;

  const user = {
    _id: id,
    email,
    name: [first_name, last_name].filter(Boolean).join(" ").trim(),
    image: image_url,
  };

  return User.findByIdAndUpdate(id, user, { upsert: true, new: true });
};

/* --- functions --- */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const doc = await saveUser(event.data);
    return { ok: true, userId: doc._id };
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();
    const doc = await saveUser(event.data);
    return { ok: true, userId: doc._id };
  }
);


const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    await User.findByIdAndDelete(event.data.id);
    return { ok: true, deleted: event.data.id };
  }
);

export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
