import { Sequelize } from "sequelize";
import * as config from "../../../config/config.js";
const { database } = config.mode === "production" ? config.production : config.development;



//Declare & Assign Connection Variables
export const connection = new Sequelize({
    database: database.db_name,
    host: database.host,
    port: process.env.DEV_DB_PORT || 13415, 
    username: database.username,
    password: database.password,
    dialect: "mysql",
    timezone: '+05:30',
    logging: false,
    dialectOptions: {
        connectTimeout: 10000, // optional, increase if needed
    },
});




export const rootuser = config.defaultdata;
export const mailerFunction = config.mailTransporter;
export const mailerHost = config.mailTransporterHost;