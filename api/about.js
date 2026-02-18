export default async function handler(req, res) {
  // GET
  if (req.method === "GET") {
    const about = await About.findOne();
    return res.status(200).json(about);
  }

  // CREATE
  if (req.method === "POST") {
    upload.single("image")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: "Image upload error" });
      }

      try {
        const existing = await About.findOne();
        if (existing) {
          return res.status(400).json({ message: "About already created" });
        }

        const { appName, description, version, developer } = req.body;

        if (!req.file) {
          return res.status(400).json({ message: "Image required" });
        }

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "about_section" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        const about = await About.create({
          appName,
          description,
          version,
          developer,
          imageUrl: result.secure_url,
        });

        return res.status(201).json(about);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    });

    return;
  }

  // UPDATE
  if (req.method === "PUT") {
    upload.single("image")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: "Image upload error" });
      }

      try {
        const about = await About.findOne();
        if (!about) {
          return res.status(404).json({ message: "About not found" });
        }

        const { appName, description, version, developer } = req.body;

        let imageUrl = about.imageUrl;

        if (req.file) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "about_section" },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });

          imageUrl = result.secure_url;
        }

        about.appName = appName || about.appName;
        about.description = description || about.description;
        about.version = version || about.version;
        about.developer = developer || about.developer;
        about.imageUrl = imageUrl;

        await about.save();

        return res.status(200).json(about);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    });

    return;
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      const about = await About.findOne();
      if (!about) {
        return res.status(404).json({ message: "About not found" });
      }

      await About.deleteOne({ _id: about._id });

      return res.status(200).json({ message: "About deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
