const mega = require("megajs");

const auth = {
  email: "Premasirimalith20@gmail.com",
  password: "lakshanM2009",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
};

const upload = (data, name) => {
  return new Promise((resolve, reject) => {
    const storage = new mega.Storage(auth);

    storage.on("ready", () => {
      console.log("Storage is ready. Proceeding with upload.");

      const uploadStream = storage.upload({ name, allowUploadBuffering: true });

      uploadStream.on("error", (err) => {
        reject(err);
      });

      uploadStream.on("end", () => {
        // Upload finished, now get link
        uploadStream.file.link((err, url) => {
          if (err) {
            reject(err);
          } else {
            // Close storage if needed
            if (storage.close) storage.close();
            resolve(url);
          }
        });
      });

      // Check if data is stream or buffer
      if (data.pipe && typeof data.pipe === "function") {
        data.pipe(uploadStream);
      } else {
        // If data is buffer or string
        uploadStream.write(data);
        uploadStream.end();
      }
    });

    storage.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = { upload };
