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
  
  // Dynamically apply FULLTEXT and status indexes to the shop table if they do not exist
  try {
    await connection.query("ALTER TABLE shop ADD FULLTEXT INDEX shops_search_idx (shopName, category, description);");
  } catch (err) {
    // Index already exists or table is not ready
  }

  try {
    await connection.query("ALTER TABLE shop ADD INDEX status_idx (status);");
  } catch (err) {
    // Index already exists or table is not ready
  }
};
