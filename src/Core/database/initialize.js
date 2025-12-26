import * as models from "./models/index.js";
import { connection } from "./connection.js";



//Check connection
export const dbConnection = async () => {
  return await connection.authenticate();
};



export const dbSync = async () => {
  //sync all Db Models
  await Promise.all(Object.values(models));


  //Create Db Models
  await connection.sync({ force: false });
  
};
