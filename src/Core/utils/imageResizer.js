import require from "requirejs";
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
import fs from "fs";
import shelljs from "shelljs";
const __dirname = path.resolve();
import dotenv from "dotenv";
import moment from "moment";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";
// ffmpeg.setFfmpegPath(ffmpegPath);

dotenv.config();

// Initialize AWS S3 Client optionally
let s3Client = null;
if (
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION
) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

//image files

export const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});


function checkFileType(file, callback) {
  const filetypes = /jpg|jpeg|pdf|docx|xlsx|pptx|csv|png/;
  const extname = filetypes.test(path.extname(file.originalname)?.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype || extname) {
    return callback(null, true);
  } else {
    callback("Check your File Type ");
  }
}

//attachments files

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    // const dir = path.join(__dirname, "/assets/originals/" + moment().format('DD-MM-YYYY'));
    const dir = path.join(__dirname, "/assets/compressed/videos/");
    if (!fs.existsSync(dir)) {
      shelljs.mkdir("-p", dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)?.toLowerCase();
    //customized original file name
    cb(null, "VID-" + Date.now() + ext);
  },
});


const uploadAttachments = multer({
  storage: fileStorageEngine,
  limits: { fileSize: 30 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => checkAttachmentType(file, cb),
});

// function checkAttachmentType(file, callback) {
//   const allowedTypes = /mp4|mov|avi|mkv|gif/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     callback(null, true);
//   } else {
//     callback(new Error("Only video files are allowed"));
//   }
// }
function checkAttachmentType(file, callback) {
  const allowedExt = /mp4|mov|avi|mkv|gif/;
  const allowedMime = /video\/|image\/gif/;

  const extname = allowedExt.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMime.test(file.mimetype);

  if (extname && mimetype) {
    callback(null, true);
  } else {
    callback(new Error("Only video files and GIFs are allowed"));
  }
}

// export const videoResizer = async (req, res, next) => {
//   uploadAttachments.single("video")(req, res, async function (error) {
//     if (error) {
//       return res.status(400).json({ error });
//     }

//     // allow null video
//     if (!req.file) {
//       req.video = null;
//       return next();
//     }

//     try {
//       const inputPath = req.file.path;
//       const ext = path.extname(req.file.originalname).toLowerCase();
//       const videoName = `VID-${Date.now()}${ext}`;

//       const outputDir = path.join(__dirname, "/assets/compressed/videos/");
//       if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//       }

//       const outputPath = path.join(outputDir, videoName);

//       // 🎥 Resize & compress video
//       // await new Promise((resolve, reject) => {
//       //   ffmpeg(inputPath)
//       //     .outputOptions([
//       //       "-vf scale=720:-2",   // resize width to 720px
//       //       "-crf 28",            // compression level (lower = better quality)
//       //       "-preset fast"
//       //     ])
//       //     .on("end", resolve)
//       //     .on("error", reject)
//       //     .save(outputPath);
//       // });

//       req.video = `/videos/${outputPath}`;
//       next();

//     } catch (err) {
//       console.log(err)
//       return res.status(500).json({ error: "Video processing failed", details: err });
//     }
//   });
// };

export const videoResizer = async (req, res, next) => {
  uploadAttachments.single("video")(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // allow null video
    if (!req.file) {
      req.video = null;
      return next();
    }

    try {
      if (s3Client && process.env.AWS_BUCKET_NAME) {
        const fileStream = fs.createReadStream(req.file.path);
        const s3Key = `videos/${req.file.filename}`;

        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
          Body: fileStream,
          ContentType: req.file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Get the S3 object URL
        req.video = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        // Cleanup local file after uploading to S3
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting local video file:", err);
        });
      } else {
        // Fallback to local storage
        req.video = `/videos/${req.file.filename}`;
      }
      next();
    } catch (err) {
      return res.status(500).json({
        error: "Video upload failed",
        details: err.message,
      });
    }
  });
};


const processAndSaveImage = async (buffer, filename) => {
  const sharpInstance = sharp(buffer)
    .resize(500)
    .png({
      quality: 80,
      chromaSubsampling: "4:4:4",
    });

  if (s3Client && process.env.AWS_BUCKET_NAME) {
    const compressedBuffer = await sharpInstance.toBuffer();
    const s3Key = `images/${filename}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: compressedBuffer,
      ContentType: "image/png",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  } else {
    const outputDir = path.join(__dirname, "/assets/compressed/images/");
    fs.mkdirSync(outputDir, { recursive: true });
    const finalPath = path.join(outputDir, filename);
    await sharpInstance.toFile(finalPath);
    return `/images/${filename}`;
  }
};


export const Resizer = async (req, res, next) => {
  uploader.single("image")(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!req.file) {
      req.image = null;
      return next();
    }

    try {
      const filename = `IMG-${Date.now()}.png`;
      req.image = await processAndSaveImage(req.file.buffer, filename);
      next();
    } catch (err) {
      return res.status(500).json({
        error: "Image processing failed",
        details: err.message,
      });
    }
  });
};


// export const GeneralResizer = async (req, res, next) => {

//   const eventDir = path.join(__dirname, "/assets/compressed/events/");
//   if (!fs.existsSync(eventDir)) {
//     shelljs.mkdir("-p", eventDir);
//   }

//   upload.fields([{ name: 'images' },])(req, res, async function (error) {
//     if (error) {
//       return res.status(400).json({ error: error, });
//     } else {
//       if (req.files.images) {
//         var images = [];
//         for (let index = 0; index < (req.files.images).length; index++) {
//           const file = req.files.images[index];
//           const ext = path.extname(file.originalname)?.toLowerCase();
//           let imagename =`IMG-${index}-${Date.now()}${ext}`;
//           // let imagename = "IMG-" + index + Date.now() + ext;
//           var compressedDocument = path.join(__dirname, "/assets/compressed/events/" + imagename);

//           await sharp(file.path)
//             .resize(500)
//             .png({ quality: 80, chromaSubsampling: "4:4:4", })
//             .toFile(compressedDocument);

//           // fs.renameSync(file.path, compressedDocument);
//           imagename = "/events/" + imagename;
//           images.push(imagename);
//         }
//       }

//       //[Object: null prototype] to plain object conversion
//       req.body = Object.assign({}, req.body);
//       req.images = images;
//     }
//     next();
//   });

// };


// export const GeneralResizer = async (req, res, next) => {
//   const outputDir = path.join(__dirname, "/assets/compressed/images/");
//   if (!fs.existsSync(outputDir)) {
//     shelljs.mkdir("-p", outputDir);
//   }

//   upload.fields([
//     { name: "shopImage", maxCount: 1 },
//     { name: "image1", maxCount: 1 },
//     { name: "image2", maxCount: 1 },
//     { name: "image3", maxCount: 1 },
//     { name: "image4", maxCount: 1 },
  
//   ])(req, res, async (error) => {
//     if (error) {
//       console.log(error);
//       return res.status(400).json({ error: error.message || "Upload error" });
//     }

//     try {
//       const profileimages = {};
//       const fields = [
//         "shopImage",
//         "image1",
//         "image2",
//         "image3",
//         "image4",
     
//       ];

//       for (let field of fields) {
//         if (req.files?.[field]?.length > 0) {
//           const file = req.files[field][0];

//           // ✅ SAFETY GUARD (no order change)
//           if (!fs.existsSync(file.path)) {
//             console.warn("File missing, skipped:", file.path);
//             continue;
//           }

//           const filename = `${field}-${Date.now()}.png`;
//           const finalPath = path.join(outputDir, filename);

//           // 🔹 Resize & compress (watermark removed)
//           await sharp(file.path)
//             .resize(500)
//             .png({ quality: 80, chromaSubsampling: "4:4:4" })
//             .toFile(finalPath);

//           profileimages[field] = `/images/${filename}`;

//           // Cleanup original
//           fs.unlinkSync(file.path);
//         }
//       }

//       req.images = profileimages;
//       next();
//     } catch (err) {
//       return res.status(500).json({
//         error: "Image processing failed",
//         details: err.message,
//       });
//     }
//   });
// };
export const GeneralResizer = async (req, res, next) => {
  try {
    const images = {};
    const fields = [
      "shopImage",
      "image1",
      "image2",
      "image3",
      "image4"
    ];

    for (const field of fields) {
      const file = req.files?.[field]?.[0];
      if (!file) continue;

      const filename = `${field}-${Date.now()}.png`;
      images[field] = await processAndSaveImage(file.buffer, filename);
    }

    req.images = images;
    next();
  } catch (err) {
    return res.status(500).json({
      error: "Image processing failed",
      details: err.message,
    });
  }
};

export const bannerResizer = async (req, res, next) => {
  try {
    const images = {};
    const fields = [
      "backgroundImage",
      "image"
    ];

    for (const field of fields) {
      const file = req.files?.[field]?.[0];
      if (!file) continue;

      const filename = `${field}-${Date.now()}.png`;
      images[field] = await processAndSaveImage(file.buffer, filename);
    }

    req.images = images;
    next();
  } catch (err) {
    return res.status(500).json({
      error: "Image processing failed",
      details: err.message,
    });
  }
};
