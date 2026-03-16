import chalk from 'chalk';
import { dbConnection, dbSync } from './database/initialize.js';
import { Logger } from './lib/logger.js';

// Execute Table from initialize.js
export const setup = async (globalConfig) => {
    // Check App Connection
    await processBlock(dbConnection, chalk.white('Database Authenticated ✔️'), chalk.red('Database Connection Failed ✖️'));

    // Sync Db Models
    await processBlock(dbSync, chalk.white('Tables have been created ✔️✔️'), chalk.red('Unable to create tables ✖️'));

    return globalConfig;
};

const processBlock = async (func, successTxt, errorTxt) => {
    try {
        await func();
        Logger.info(successTxt);
    } catch (error) {
        Logger.error(errorTxt);
        Logger.error(error.message);   
        Logger.error(error.stack);   
        throw error;                  
    }
};
