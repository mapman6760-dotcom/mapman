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
import { appDbController } from "../database/Controller/appDbController.js";
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

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

// const fileStorageEngine = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // const dir = path.join(__dirname, "/assets/originals/" + moment().format('DD-MM-YYYY'));
//     const dir = path.join(__dirname, "/assets/compressed/videos/");
//     if (!fs.existsSync(dir)) {
//       shelljs.mkdir("-p", dir);
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname)?.toLowerCase();
//     //customized original file name
//     cb(null, "VID-" + Date.now() + ext);
//   },
// });

// const fileStorageEngine = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = path.join(__dirname, "/assets/compressed/videos/");
//     if (!fs.existsSync(dir)) {
//       shelljs.mkdir("-p", dir);
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname)?.toLowerCase();
//     cb(null, "temp-VID-" + Date.now() + ext);
//   },
// });

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "/assets/compressed/videos/");
    if (!fs.existsSync(dir)) {
      shelljs.mkdir("-p", dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)?.toLowerCase();
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

// export const videoResizer = async (req, res, next) => {
//   uploadAttachments.single("video")(req, res, async (error) => {
//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
// 
//     // allow null video
//     if (!req.file) {
//       req.video = null;
//       return next();
//     }
// 
//     try {
//       if (s3Client && process.env.AWS_BUCKET_NAME) {
//         const fileStream = fs.createReadStream(req.file.path);
//         const s3Key = `videos/${req.file.filename}`;
// 
//         const uploadParams = {
//           Bucket: process.env.AWS_BUCKET_NAME,
//           Key: s3Key,
//           Body: fileStream,
//           ContentType: req.file.mimetype,
//         };
// 
//         await s3Client.send(new PutObjectCommand(uploadParams));
// 
//         // Get the S3 object URL
//         req.video = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
// 
//         // Cleanup local file after uploading to S3
//         fs.unlink(req.file.path, (err) => {
//           if (err) console.error("Error deleting local video file:", err);
//         });
//       } else {
//         // Fallback to local storage
//         req.video = `/videos/${req.file.filename}`;
//       }
//       next();
//     } catch (err) {
//       return res.status(500).json({
//         error: "Video upload failed",
//         details: err.message,
//       });
//     }
//   });
// };

// export const videoResizer = async (req, res, next) => {
//   uploadAttachments.single("video")(req, res, async (error) => {
//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
// 
//     // allow null video
//     if (!req.file) {
//       req.video = null;
//       return next();
//     }
// 
//     const inputPath = req.file.path;
//     const finalFilename = req.file.filename.replace(/^temp-/, "");
//     const outputDir = path.dirname(inputPath);
//     const outputPath = path.join(outputDir, finalFilename);
// 
//     try {
//       // 🎥 Compress video using ffmpeg (H.264 / AAC at 720p resolution)
//       await new Promise((resolve, reject) => {
//         ffmpeg(inputPath)
//           .outputOptions([
//             "-vcodec libx264",
//             "-crf 20",
//             "-preset superfast",
//             "-pix_fmt yuv420p",
//             "-acodec aac"
//           ])
//           .on("end", () => resolve())
//           .on("error", (err) => {
//             console.warn("FFmpeg compression with audio failed, retrying without audio stream:", err.message);
//             ffmpeg(inputPath)
//               .outputOptions([
//                 "-vcodec libx264",
//                 "-crf 20",
//                 "-preset superfast",
//                 "-pix_fmt yuv420p",
//                 "-an"
//               ])
//               .on("end", () => resolve())
//               .on("error", (retryErr) => reject(retryErr))
//               .save(outputPath);
//           })
//           .save(outputPath);
//       });
// 
//       // Cleanup local original (temp-) file
//       fs.unlink(inputPath, (err) => {
//         if (err) console.error("Error deleting local temp video file:", err);
//       });
// 
//       if (s3Client && process.env.AWS_BUCKET_NAME) {
//         const fileStream = fs.createReadStream(outputPath);
//         const s3Key = `videos/${finalFilename}`;
// 
//         const uploadParams = {
//           Bucket: process.env.AWS_BUCKET_NAME,
//           Key: s3Key,
//           Body: fileStream,
//           ContentType: req.file.mimetype,
//         };
// 
//         await s3Client.send(new PutObjectCommand(uploadParams));
// 
//         // Get the S3 object URL
//         req.video = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
// 
//         // Cleanup local compressed file after uploading to S3
//         fs.unlink(outputPath, (err) => {
//           if (err) console.error("Error deleting local compressed video file:", err);
//         });
//       } else {
//         // Fallback to local storage
//         req.video = `/videos/${finalFilename}`;
//       }
//       next();
//     } catch (err) {
//       // Clean up inputPath if it still exists
//       if (fs.existsSync(inputPath)) {
//         fs.unlink(inputPath, () => {});
//       }
//       // Clean up outputPath if it was partially created
//       if (fs.existsSync(outputPath)) {
//         fs.unlink(outputPath, () => {});
//       }
//       return res.status(500).json({
//         error: "Video compression failed",
//         details: err.message,
//       });
//     }
//   });
// };

const compressAndUploadVideoBackground = async (tempFilename, finalMp4Filename) => {
  const localDir = path.join(__dirname, "/assets/compressed/videos/");
  const inputPath = path.join(localDir, tempFilename);
  const outputPath = path.join(localDir, finalMp4Filename);
  const tempOutputPath = path.join(localDir, "compress-" + finalMp4Filename);

  try {
    // Wait a couple seconds to make sure the HTTP request completed and DB row is created
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (!fs.existsSync(inputPath)) {
      console.error("Original video file not found for background compression:", inputPath);
      return;
    }

    // 🎥 Compress video using ffmpeg (H.264 / AAC at original resolution)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-vcodec libx264",
          "-crf 20",
          "-preset superfast",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-acodec aac"
        ])
        .on("end", () => resolve())
        .on("error", (err) => {
          console.warn("Background FFmpeg compression with audio failed, retrying without audio stream:", err.message);
          ffmpeg(inputPath)
            .outputOptions([
              "-vcodec libx264",
              "-crf 20",
              "-preset superfast",
              "-pix_fmt yuv420p",
              "-movflags +faststart",
              "-an"
            ])
            .on("end", () => resolve())
            .on("error", (retryErr) => reject(retryErr))
            .save(tempOutputPath);
        })
        .save(tempOutputPath);
    });

    // Delete the original raw upload file (if it had a different format like .mov or .avi)
    if (fs.existsSync(inputPath) && inputPath !== outputPath) {
      fs.unlinkSync(inputPath);
    }

    // Replace final video path with compressed file locally
    if (fs.existsSync(tempOutputPath)) {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      fs.renameSync(tempOutputPath, outputPath);
    }

    // S3 upload if configured
    if (s3Client && process.env.AWS_BUCKET_NAME) {
      const fileStream = fs.createReadStream(outputPath);
      const s3Key = `videos/${finalMp4Filename}`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: "video/mp4", // Force to video/mp4 MIME type
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      
      // Construct CDN or S3 URL
      const s3Url = process.env.CDN_URL 
        ? `${process.env.CDN_URL.replace(/\/$/, "")}/${s3Key}` 
        : `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      // Query database to update the video URL
      const localUrl = `/videos/${finalMp4Filename}`;
      let updated = false;
      // Retry database update up to 10 times in case database insertion has slight latency
      for (let i = 0; i < 10; i++) {
        try {
          const videoRow = await appDbController.Models.video.findOne({
            where: { video: localUrl }
          });
          if (videoRow) {
            await videoRow.update({ video: s3Url });
            updated = true;
            console.log(`Successfully updated S3 URL in database for video ID: ${videoRow.id}`);
            break;
          }
        } catch (dbErr) {
          console.error("Database update attempt failed:", dbErr.message);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!updated) {
        console.warn(`Could not find database row for video URL: ${localUrl} after multiple attempts.`);
      }

      // Cleanup local file after uploading to S3
      fs.unlink(outputPath, (err) => {
        if (err) console.error("Error deleting local video file:", err);
      });
    }
  } catch (err) {
    console.error("Background video processing failed:", err.message);
    if (fs.existsSync(tempOutputPath)) {
      fs.unlink(tempOutputPath, () => {});
    }
  }
};

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
      // Get the base filename without extension, and force the target to end with .mp4
      const ext = path.extname(req.file.filename);
      const finalMp4Filename = req.file.filename.replace(ext, ".mp4");

      // Immediately set local path so database registration proceeds instantly
      req.video = `/videos/${finalMp4Filename}`;
      
      // Spawn video compression & upload asynchronously in the background
      compressAndUploadVideoBackground(req.file.filename, finalMp4Filename);
      
      next();
    } catch (err) {
      return res.status(500).json({
        error: "Video registration failed",
        details: err.message,
      });
    }
  });
};


// const processAndSaveImage = async (buffer, filename) => {
//   const sharpInstance = sharp(buffer)
//     .resize(500)
//     .png({
//       quality: 80,
//       chromaSubsampling: "4:4:4",
//     });
// 
//   if (s3Client && process.env.AWS_BUCKET_NAME) {
//     const compressedBuffer = await sharpInstance.toBuffer();
//     const s3Key = `images/${filename}`;
// 
//     const uploadParams = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: s3Key,
//       Body: compressedBuffer,
//       ContentType: "image/png",
//     };
// 
//     await s3Client.send(new PutObjectCommand(uploadParams));
//     return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
//   } else {
//     const outputDir = path.join(__dirname, "/assets/compressed/images/");
//     fs.mkdirSync(outputDir, { recursive: true });
//     const finalPath = path.join(outputDir, filename);
//     await sharpInstance.toFile(finalPath);
//     return `/images/${filename}`;
//   }
// };

const processAndSaveImage = async (buffer, filename) => {
  const ext = path.extname(filename).toLowerCase();
  let sharpInstance = sharp(buffer);

  let contentType = "image/png";
  if (ext === ".png") {
    sharpInstance = sharpInstance.png({
      compressionLevel: 9,
    });
    contentType = "image/png";
  } else if (ext === ".jpg" || ext === ".jpeg") {
    sharpInstance = sharpInstance.jpeg({
      quality: 95,
      progressive: true,
    });
    contentType = "image/jpeg";
  } else if (ext === ".webp") {
    sharpInstance = sharpInstance.webp({
      quality: 95,
    });
    contentType = "image/webp";
  } else {
    sharpInstance = sharpInstance.png({
      compressionLevel: 9,
    });
    contentType = "image/png";
  }

  if (s3Client && process.env.AWS_BUCKET_NAME) {
    const compressedBuffer = await sharpInstance.toBuffer();
    const s3Key = `images/${filename}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: compressedBuffer,
      ContentType: contentType,
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


// export const Resizer = async (req, res, next) => {
//   uploader.single("image")(req, res, async (error) => {
//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
// 
//     if (!req.file) {
//       req.image = null;
//       return next();
//     }
// 
//     try {
//       const filename = `IMG-${Date.now()}.png`;
//       req.image = await processAndSaveImage(req.file.buffer, filename);
//       next();
//     } catch (err) {
//       return res.status(500).json({
//         error: "Image processing failed",
//         details: err.message,
//       });
//     }
//   });
// };

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
      const ext = path.extname(req.file.originalname).toLowerCase() || ".png";
      const filename = `IMG-${Date.now()}${ext}`;
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
// export const GeneralResizer = async (req, res, next) => {
//   try {
//     const images = {};
//     const fields = [
//       "shopImage",
//       "image1",
//       "image2",
//       "image3",
//       "image4"
//     ];
// 
//     for (const field of fields) {
//       const file = req.files?.[field]?.[0];
//       if (!file) continue;
// 
//       const filename = `${field}-${Date.now()}.png`;
//       images[field] = await processAndSaveImage(file.buffer, filename);
//     }
// 
//     req.images = images;
//     next();
//   } catch (err) {
//     return res.status(500).json({
//       error: "Image processing failed",
//       details: err.message,
//     });
//   }
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

      const ext = path.extname(file.originalname).toLowerCase() || ".png";
      const filename = `${field}-${Date.now()}${ext}`;
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

// export const bannerResizer = async (req, res, next) => {
//   try {
//     const images = {};
//     const fields = [
//       "backgroundImage",
//       "image"
//     ];
// 
//     for (const field of fields) {
//       const file = req.files?.[field]?.[0];
//       if (!file) continue;
// 
//       const filename = `${field}-${Date.now()}.png`;
//       images[field] = await processAndSaveImage(file.buffer, filename);
//     }
// 
//     req.images = images;
//     next();
//   } catch (err) {
//     return res.status(500).json({
//       error: "Image processing failed",
//       details: err.message,
//     });
//   }
// };

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

      const ext = path.extname(file.originalname).toLowerCase() || ".png";
      const filename = `${field}-${Date.now()}${ext}`;
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
