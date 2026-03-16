import { Sequelize } from "sequelize";
import * as config from "../../../config/config.js";

// Ensure production is the default if NODE_ENV is unset or malformed on Railway
const isDev = config.mode?.trim() === "development";
const { database } = isDev ? config.development : config.production;

console.log("-----------------------------------------");
console.log(`[DB INIT] Environment: ${isDev ? 'Development' : 'Production'}`);
console.log(`[DB INIT] Attempting to connect to Host: ${database.host}`);
console.log(`[DB INIT] Attempting to connect to Port: ${database.port || 3306}`);
console.log(`[DB INIT] Attempting to connect to Database: ${database.db_name}`);
console.log("-----------------------------------------");

//Declare & Assign Connection Variables
export const connection = new Sequelize({
    database: database.db_name,
    host: database.host,
    port: database.port || 3306, 
    username: database.username,
    password: database.password,
    dialect: "mysql",
    timezone: '+05:30',
    logging: false,
    dialectOptions: {
        connectTimeout: 10000, // optional, increase if needed
    },
});


//Declare & Assign Connection Variables


// export const connection = new Sequelize({
//     database: database.db_name,
//     host: database.host,
//     username: database.username,
//     password: database.password,
//     dialect: "mysql",
//     timezone: '+05:30',
//     logging: false,
//     // logging: console.log,
// });




export const rootuser = config.defaultdata;
export const mailerFunction = config.mailTransporter;
export const mailerHost = config.mailTransporterHost;