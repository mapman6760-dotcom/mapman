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

  // Ensure new bank details and shop columns exist in payoutLogs table
  const payoutLogsColumns = [
    "ALTER TABLE payoutLogs ADD COLUMN shopId BIGINT NULL;",
    "ALTER TABLE payoutLogs ADD COLUMN accountHolderName VARCHAR(255) NULL;",
    "ALTER TABLE payoutLogs ADD COLUMN accountNumber VARCHAR(255) NULL;",
    "ALTER TABLE payoutLogs ADD COLUMN ifscCode VARCHAR(255) NULL;",
    "ALTER TABLE payoutLogs ADD COLUMN upiId VARCHAR(255) NULL;"
  ];

  for (const query of payoutLogsColumns) {
    try {
      await connection.query(query);
    } catch (err) {
      // Column already exists or table is not ready
    }
  }

  // Ensure upi column exists in profile table
  try {
    await connection.query("ALTER TABLE profile ADD COLUMN upi VARCHAR(255) NULL;");
  } catch (err) {
    // Column already exists or table is not ready
  }

  // Ensure offerCouponCode / offerCoupon column exists in myOffers table
  try {
    await connection.query("ALTER TABLE myOffers ADD COLUMN offerCouponCode VARCHAR(255) NULL;");
  } catch (err) {
    // Column already exists or table is not ready
  }
  try {
    await connection.query("ALTER TABLE myOffers ADD COLUMN offerCoupon VARCHAR(255) NULL;");
  } catch (err) {
    // Column already exists or table is not ready
  }

  // Ensure offerCouponHistory table exists
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS offerCouponHistory (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        profileId BIGINT NOT NULL,
        shopId BIGINT NULL,
        offerId BIGINT NULL,
        offerCouponCode VARCHAR(255) NULL,
        couponCode VARCHAR(255) NULL,
        amount FLOAT NOT NULL DEFAULT 0,
        couponDiscount FLOAT NOT NULL DEFAULT 0,
        totalPay FLOAT NOT NULL DEFAULT 0,
        cashback FLOAT NOT NULL DEFAULT 0,
        status ENUM('applied', 'cancelled') NOT NULL DEFAULT 'applied',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_profile_coupon (profileId, offerCouponCode)
      );
    `);
  } catch (err) {
    // Table already exists or table is not ready
  }
  try {
    await connection.query("ALTER TABLE offerCouponHistory ADD COLUMN offerCouponCode VARCHAR(255) NULL;");
  } catch (err) {
    // Column already exists
  }
};
