import chalk from 'chalk'
import { dbConnection, dbSync } from './database/initialize.js'
import { Logger } from './lib/logger.js';


//Execute Table from initializejs
export const setup = async (gloablConfig) => {
    
    // Check App Connection
    console.log();
    await processBlock(dbConnection, chalk.white('Database Authenticated  ✔️ '), chalk.red('Database Connection Failed ✖️'));
    
    await processBlock(dbSync, chalk.white('Tables have Created  ✔️ ✔️ '),  chalk.red('Unable to Create Tables ✖️'));
    //Sync Db Models
    dbSync();
    
    return gloablConfig
    
}

const processBlock = async (func,successTxt, errorTxt) => {
    try {
        await func();
        Logger.info(successTxt)
    } catch (error) {
        Logger.error(errorTxt)
        throw new Error(error)
    }
}

