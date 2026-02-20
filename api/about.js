import dbConnect from "../lib/db.js";
import About from "../models/about.js";
import auth from "../middleware/auth.middleware.js";

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  try {

    // 🔹 GET (Public)
    if (method === "GET") {
      const about = await About.findOne();
      return res.status(200).json(about);
    }

    // 🔐 Protect everything except GET
    const user = auth(req, res);
    if (!user) return;

    // 🔹 CREATE (Only if not exists)
    if (method === "POST") {

      const existing = await About.findOne();
      if (existing) {
        return res.status(400).json({ message: "About already exists" });
      }

      const { appName, description, version, developer, image } = req.body;

      const about = await About.create({
        appName,
        description,
        version,
        developer,
        image,
      });

      return res.status(201).json(about);
    }

    // 🔹 UPDATE
    if (method === "PUT") {
      const about = await About.findOne();

      if (!about) {
        return res.status(404).json({ message: "About not found" });
      }

      const { appName, description, version, developer, image } = req.body;

      if (appName) about.appName = appName;
      if (description) about.description = description;
      if (version) about.version = version;
      if (developer) about.developer = developer;
      if (image) about.image = image;

      const updated = await about.save();

      return res.status(200).json(updated);
    }

    // 🔹 DELETE
    if (method === "DELETE") {
      await About.deleteMany();
      return res.status(200).json({ message: "Deleted successfully" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}