import sequelize from "sequelize";
const { Model, DataTypes } = sequelize;
import { connection } from "../connection.js";

class profile extends Model { }

profile.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  otpCode: {
    type: DataTypes.INTEGER(10),
    allowNull: true,
  },
  otpExpiry: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  otpCount: {
    type: DataTypes.INTEGER(6),
    allowNull: false,
    defaultValue: 0,
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profilePic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fcmToken: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
    defaultValue:"[]"
  },
  isPhoneVerified: {
    type: DataTypes.ENUM("yes", "no"),
    allowNull:true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'terminated'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  sequelize: connection,
  freezeTableName: true,
});

class profileAuth extends Model { }

profileAuth.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  profileId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  token: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  ipv4: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  sequelize: connection,
  freezeTableName: true,
});

class userLogs extends Model { }

userLogs.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER(255),
      allowNull: false,
    },
    logDescription: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  { sequelize: connection, freezeTableName: true }
);

class shop extends Model { }

shop.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  profileId: {
    type: DataTypes.BIGINT,
    allowNull:false
  },
  shopImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lat: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  long: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
   type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  description: {
   type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  whatsappNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  registerNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shopNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  openTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  closeTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image1: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image3: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image4: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imageApprove: {
    type: DataTypes.BOOLEAN,
    allowNull:true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  sequelize: connection,
  freezeTableName: true,
});

class category extends Model { }

category.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  addedPerson: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  categoryType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  sequelize: connection,
  freezeTableName: true,
});

class categoryVideo extends Model { }

categoryVideo.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryVideo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  sequelize: connection,
  freezeTableName: true,
});

class video extends Model { }

video.init({
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  profileId: {
    type: DataTypes.BIGINT,
    allowNull:false
  },
  shopId: {
    type: DataTypes.BIGINT,
    allowNull:false
  },
  video: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videoTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
}, {
  sequelize: connection,
  freezeTableName: true,
});

class otpLogs extends Model { }

otpLogs.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    requestId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    msgType: {
      type: DataTypes.ENUM("otp", "order", "return"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: true,
      defaultValue: "inactive",
    },
  },
  { sequelize: connection, freezeTableName: true }
);

class saveVideos extends Model { }

saveVideos.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    videoId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: true,
    },
  },
  { sequelize: connection, freezeTableName: true }
);

class viewedVideos extends Model { }

viewedVideos.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    videoId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: true,
    },
  },
  { sequelize: connection, freezeTableName: true }
);

class pushMessaging extends Model { }

pushMessaging.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    msgTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    msgImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    msgLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    msgType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    msgDesc: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    msgStatus: {
      type: DataTypes.ENUM("pending", "accepted"),
      allowNull: false,
    },
    readStatus: {
      type: DataTypes.ENUM("read", "unread"),
      defaultValue: "unread",
      allowNull: false,
    },
    openStatus: {
      type: DataTypes.ENUM("opened", "notOpened"),
      defaultValue: "notOpened",
      allowNull: false,
    },
  },
  { sequelize: connection, freezeTableName: true }
);

class notificationPreferences extends Model { }

notificationPreferences.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    enableNotifications: {
      type: DataTypes.BOOLEAN(),
      allowNull: false,
      defaultValue: true
    },
    savedVideo: {
      type: DataTypes.BOOLEAN(),
      allowNull: false,
      defaultValue: true
    },
    newVideo: {
      type: DataTypes.BOOLEAN(),
      allowNull: false,
      defaultValue: true
    },
    newShop: {
      type: DataTypes.BOOLEAN(),
      allowNull: false,
      defaultValue: true
    },
  },
  { sequelize: connection, freezeTableName: true }
);

export { shop, profileAuth, category ,profile,video,otpLogs,userLogs,saveVideos,viewedVideos,categoryVideo,notificationPreferences,pushMessaging};


