// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// export const mode = process.env.NODE_ENV;
// export const development = {
//   database: {
//     appName: process.env.APP_NAME,
//     db_name: process.env.DEV_DB_NAME,
//     host: process.env.DEV_DB_HOST,
//     port: process.env.DEV_DB_PORT,
//     username: process.env.DEV_DB_USERNAME,
//     password: process.env.DEV_DB_PASSWORD,
//   },
//   server: {
//     port: process.env.DEV_PORT,
//     mode: process.env.NODE_ENV,
//   },
// };

// export const production = {
//   database: {
//     appName: process.env.APP_NAME,
//     db_name: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.PORT,
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//   },
//   server: {
//     port: process.env.PORT,
//   },
// };


// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// export const mode = process.env.NODE_ENV;
// export const development = {
//   database: {
//     appName: process.env.APP_NAME,
//     db_name: process.env.DEV_DB_NAME,
//     host: process.env.DEV_DB_HOST,
//     port: process.env.DEV_DB_PORT,
//     username: process.env.DEV_DB_USERNAME,
//     password: process.env.DEV_DB_PASSWORD,
//   },
//   server: {
//     port: process.env.DEV_PORT,
//     mode: process.env.NODE_ENV,
//   },
// };

// export const production = {
//   database: {
//     appName: process.env.APP_NAME,
//     db_name: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.PORT,
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//   },
//   server: {
//     port: process.env.PORT,
//   },
// };




import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const mode = process.env.NODE_ENV;
export const development = {
  database: {
    appName: process.env.APP_NAME,
    db_name: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
  },
  server: {
    port: process.env.DEV_PORT,
    mode: process.env.NODE_ENV,
  },
};

export const production = {
  database: {
    appName: process.env.APP_NAME,
    db_name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  server: {
    port: process.env.PORT,
  },
};

