import express from "express";
import { connection } from "../connection.js";
import * as Models from "../models/index.js";
import require from "requirejs";
import * as Error from "../../errors/ErrorConstant.js"
import { categoryId } from "../../schema/schema.js";
const { Op, Sequelize, where } = require("sequelize");
export class appDbController { }
appDbController.scope = "defaultScope";
appDbController.Models = Models;
appDbController.connection = connection;
appDbController.defaults = {};


appDbController.Auth = {


  checkIdExists: async (data) => {
    try {
      return await appDbController.Models.profile.findOne({
        where: {
          id: data.userId,
        },
        raw: true,
      });
    } catch (error) {
      return null
    }
  },

  checkUserExists: async (data) => {
    try {
      return await appDbController.Models.Student.findOne({
        where: {
          [Op.or]: {
            email: data.email,
            phone: data.phoneNumber,
          },
        },
        raw: true,
      });
    } catch (error) {
      return null
    }
  },

  createUid: async (data) => {

    try {
      const updated_data = await appDbController.Models.Student.update(
        { code: data.code, expiry: data.expiry },
        { where: { id: data.id } },
        { plain: true, returning: true }
      );
      if (updated_data[0] == 1) {
        return appDbController.Models.Student.findOne({
          where: { email: data.email },
          attributes: ["useruserName", "email", "code"],
          raw: true,
        });
      } else {
        return null;
      }
    } catch (error) {
      return null
    }
  },
  verifyOtp: async (data) => {
    try {
      return await appDbController.Models.Student.findOne({
        where: { email: data.email, code: data.code },
      });
    } catch (error) {
      return null
    }
  },
  otpCount: async (data) => {
    try {
      return await appDbController.Models.profile.update(
        { otpCount: data.count },
        { where: { id: data.id } },
      );

    } catch (error) {
      return null
    }
  },
  checkPhoneExists: async (data) => {
    try {
      return await appDbController.Models.profile.findOne({
        where: {
          // phone: "+91"+data.phone,
          phone: data.phoneNumber,
        },
        raw: true,
      });
    } catch (error) {
      return null;
    }
  },
  registerMobile: async (data) => {
    try {
      return await appDbController.Models.profile.create({
        phone: data.phoneNumber,
        profileCreated: "user",
        // phone: "+91" + data.phoneNumber,
        isPhoneVerified: "yes",
        otpCount: 1,
        status: "active"
      },
        { raw: true });
    } catch (error) {
      return null;
    }
  },
  addMobile: async (data) => {
    try {
      return await appDbController.Models.profile.create({
        phone: data.phoneNumber,
        isPhoneVerified: "yes",
        otpCount: 1,
       // status:"active"
      },
        {
          raw: true
        });
    } catch (error) {
      return null;
    }
  },
  session: {
    createSession: async (data, device) => {
      try {
        return await appDbController.Models.profileAuth.create({
          profileId: data.profileId,
          token: data.token,
          ipv4: device.ip || device.ipv,
          userAgent: device.userAgent,
        });
      } catch (error) {
          return null
      }
    },
    findSession: async (token) => {
      try {
        return await appDbController.Models.profileAuth.findOne({
          where: {
            token: token
          },
          raw: true
        })
      } catch (error) {

        return null;
      }
    },
    destroySession: async (headerToken) => {
      try {
        return await appDbController.Models.profileAuth.update({
          status: 'inactive'
        }, {
          where: {
            // [Op.or]: {
            token: headerToken,
            // userId: token
            // }
          }
        })
      } catch (error) {

        return null
      }
    },
    createLogs: async (token, date) => {
      try {
        return await appDbController.Models.userLogs.create({
          userId: token,
          logDescription: date,
        });
      } catch (error) {
          return null
      }
    },
  },
  forgotPasswordPhone: async (data) => {
    try {
      return await appDbController.Models.profile.findOne({
        where: {
          phone: data.phoneNumber,
          status: { [Op.ne]: "terminated" }
        },
        raw: true,
      });
    } catch (error) {
      return null;
    }
  },

  createOTPLog: async (data) => {
    try {
      return await appDbController.Models.otpLogs.create({
        userId: data.id,
        userName: data.userName,
        phone: data.phone,
        requestId: data.requestId,
        type: data.type,
        msgType: data.msgType,
        status: "active",
      });
    } catch (error) {
      return null
    }
  },
  addOTPLog: async (data) => {
    try {
      return await appDbController.Models.otpLogs.update({
        userName: data.userName,
        phone: "91" + data.phoneNumber,
        requestId: data.requestId,
        type: data.type,
        msgType: data.msgType,
        status: "active",
      },
        {
          where: {
            userId: data.id,
          }
        }
      );
    } catch (error) {
      return null
    }
  },

  createOTPExpiry: async (data) => {
    try {
      return await appDbController.Models.profile.update(
        { otpCode: data.code, otpExpiry: data.expiry, otpCount: data.otpCount },
        { where: { id: data.id } },
        { plain: true, returning: true }
      );
    } catch (error) {
      return null
    }
  },

  updateOTPExpiry: async (data) => {
    try {
      return await appDbController.Models.profile.update(
        { otpCode: 0, otpExpiry: 0, isPhoneVerified: "yes", status: "active" },
        { where: { id: data.id } }
        // { plain: true, returning: true }
      );
    } catch (error) {
      return null
    }
  },

  addDeviceId: async (token, data) => {
    try {
      return await appDbController.Models.profile.update(
        {
          fcmToken: data.fcmToken,
        },
        {
          where: {
            id: token,
          },
        }
      );
    } catch (error) {
      return null;
    }
  },
};

appDbController.Profile = {

  addCategory: async (token,data) => {
    try{
      return await appDbController.Models.category.create({
        addedPerson: token,
        categoryType:"others",
        categoryName: data.categoryName,
        status:"active"
       })
    } catch (error) {
      return null
    }
  },

  points: async (token) => {
    try{
      return await appDbController.Models.profile.findOne({
        where: {
           id:token,
           status:"active"
        },
        raw: true,
        attributes:["id","points"]
       })
    } catch (error) {
      return null
    }
  },

  fetchCategory: async (token) => {
    try{
      let category= await appDbController.Models.category.findAll({
        where: {
          // categoryType:"default",
          status: "active",
          addedPerson:0
        },
        raw: true,
        attributes:["id","categoryName","categoryImage","categoryType"]
      })
      let tokenCategory = await appDbController.Models.category.findOne({
        where: {
          status: "active",
          addedPerson:token
        },
        raw: true,
        attributes:["id","categoryName","categoryImage","categoryType"]
      })
      if (tokenCategory != null && tokenCategory != undefined) {
        category.push(tokenCategory)
      } else {
        category=category
      }
      return category
    } catch (error) {
      return null
    }
  },

  getProfile: async (token) => {
    try {
      return await appDbController.Models.profile.findOne({
        where: {
          id: token,
          status:"active"
        },
        attributes:["id","userName","profilePic","phone","email","points","fcmToken"],
        raw: true
      })
    } catch (error) {
      return null
    }
  },

  totalVideos: async (token) => {
    try {
      return await appDbController.Models.video.findAll({
        where: {
          profileId: token,
          status:"active"
        },raw:true
      })
    } catch (error) {
      return null
    }
  },

  totalViews: async (token,data) => {
    try {
      return await appDbController.Models.viewedVideos.findAll({
        where: {
          // userId: token,
          videoId: {
            [Op.in]:data
          },
          status:"active"
        },raw:true
      })
  
    } catch (error) {
      return null
    }
  },

  updateProfile: async (token,data,image) => {
    try {
      return await appDbController.Models.profile.update(
        {
          userName: data.userName,
          profilePic: image,
          email:data.email
        },
        {
          where: {
            id: token,
            status:"active"
          }
        }
      )
    } catch (error) {
      return null
    }
  },

  fetchCategoryBasedShop: async (token,data) => {
    try{
      return await appDbController.Models.shop.findAll({
        where: {
          profileId: {
            [Op.ne]:token
          },
          category:data.category,
          status:"active"
        },
        raw: true,
       })
    } catch (error) {
      return null
    }
  },

  deleteAccount: async (token) => {
    try {
      return await appDbController.Models.profile.update(
        {
         status:"terminated"
        },
        {
          where: {
            id: token,
            status:"active"
          }
        }
      )
    } catch (error) {
      return null
    }
  },

}

appDbController.Shop = {
  
  addReview:async (token,data) => {
    try {
      return await appDbController.Models.reviews.create({
          userId: token,
          reviews:data.reviews,
          status:"active"
        
      })
    } catch (error) {
      return null
    }
  },
  
  checkReview:async (token) => {
    try {
      return await appDbController.Models.reviews.findOne({
        where: {
          userId: token,
          status:"active"
        },
         raw:true        
      })
    } catch (error) {
      return null
    }
  },
  
  getShop: async (token) => {
    try {
      return await appDbController.Models.shop.findOne({
        where: {
          profileId: token,
          status:"active"
        },raw:true
      })
    } catch (error) {
      return null
    }
  },
  
  getShopById: async (data) => {
    try {
      return await appDbController.Models.shop.findOne({
        where: {
          id: data.shopId,
          status:"active"
        },raw:true
      })
    } catch (error) {
      return null
    }
  },
  
  shopVideos: async (data) => {
    try {
      let videos= await appDbController.Models.video.findAll({
        where: {
          shopId: data.shopId,
          status:"active"
        },raw:true
      })
      for (let i = 0; i < videos.length; i++)
        {
          let count = await appDbController.Models.viewedVideos.count({
            where: {
              videoId: videos[i].id,
              status:"active"
          },
          raw: true,
          })
          videos[i].views=count||0
        }
        return videos
    } catch (error) {
      return null
    }
  },
  
  fetchVideoId: async (token,data) => {
    try {
      return await appDbController.Models.video.findOne({
        where: {
          profileId: token,
          id:data.videoId,
          status:"active"
        },raw:true
      })
    } catch (error) {
      return null
    }
  },

  replaceVideo: async (token, data, video) => {
    try {
      const update = await appDbController.Models.video.update(
        {
        video:video
        },
        {
        where: {
          profileId: token,
          id:data.videoId,
          status:"active"
          }
        }
      )
      if (update[0] !=0) {
        return "Video replaced"
      }else{
        throw Error.InternalError("Failed to replace the video")
      }
    } catch (error) {
      return null
    }
  },

  registerShop: async (token, data,images) => {
    try {      
      return await appDbController.Models.shop.create({
        profileId: token,
        shopImage: images.shopImage,
        shopName:data.shopName,
        category:data.category,
        lat:data.lat,
        long:data.long,
        address:data.address,
        description: data.description,
        whatsappNumber:data.whatsappNumber,
        registerNumber:data.registerNumber,
        shopNumber:data.shopNumber,
        openTime:data.openTime,
        closeTime:data.closeTime,
        image1:images.image1,
        image2:images.image2,
        image3:images.image3,
        image4: images.image4,
        status:"active"
       })
    } catch (error) {
      console.log(error)
      return null
    }
  },
  
  shopUpdate: async (token, data,images) => {
    try {      
      const update= await appDbController.Models.shop.update(
        {
        shopImage: images.shopImage,
        shopName:data.shopName,
        category:data.category,
        lat:data.lat,
        long:data.long,
        address:data.address,
        description:data.description,
        whatsappNumber:data.whatsappNumber,
        // registerNumber:data.registerNumber,
        shopNumber:data.shopNumber,
        openTime:data.openTime,
        closeTime:data.closeTime,
        image1:images.image1,
        image2:images.image2,
        image3:images.image3,
        image4:images.image4,
        },
        {
          where: {
            profileId: token,
            status:"active"
          }
        }
      )
      if (update[0] != 0) {
        return "Shop details updated"
      } else {
        throw Error.InternalError("Failed to update shop details")
      }
    } catch (error) {
      console.log(error)
      return null
    }
  },

  videoUpload: async (data,token,video)=>{
    try {
      return await appDbController.Models.video.create({
        profileId:token,
        shopId: data.shopId,
        video: video,
        videoTitle:data.videoTitle,
        shopName:data.shopName,
        category:data.category,
        description:data.description,
        status:"active"
       })
    } catch (error){
       return null
    };
  },

  updateVideoDetails: async (data,token)=>{
    try {
      return await appDbController.Models.video.update(
        {
        profileId:token,
        shopId: data.shopId,
        videoTitle:data.videoTitle,
        shopName:data.shopName,
        category:data.category,
        description:data.description,
        status:"active"
        }, {
          where: {
            id:data.videoId
          }
        }
      )
    } catch (error){
       return null
    };
  },

  deleteVideo: async (data,token)=>{
    try {
      return await appDbController.Models.video.update(
        {
        status:"inactive"
        }, {
          where: {
            profileId:token,
            id: data.videoId
            
          }
        }
      )
    } catch (error) {
       return null
    };
  },

  deleteShop: async (token,data)=>{
    try {
      let update1
      const update= await appDbController.Models.shop.update(
        {
        status:"inactive"
        },
        {
          where: {
            id: data.shopId,
            profileId: token,
            status:"active"
          }
        }
      )
      const checkVideo = await appDbController.Models.video.findAll({
        where:
        {
          profileId: token,
          shopId: data.shopId,
          status: "active"
        }
      })
      if (checkVideo != null && checkVideo != undefined && checkVideo.length != 0) {
       update1= await appDbController.Models.video.update(
          {
          status:"inactive"
          },
          {
            where: {
              profileId: token,
              shopId: data.shopId,
              status:"active"
            }
          })
      } else {
         update1=1
      }
     
        if (update[0] != 0 && update1[0] != 0) {
          return "Shop deleted"
        } else {
          throw Error.InternalError("Failed to delete the shop")
        }   
    } catch (error) {
      console.log(error)
       return null
    };
  },

  deleteShopImage: async (token,data)=>{
    try {
      return await appDbController.Models.shop.update(
        {
         [data.input]:null
        },
        {
          where: {
            id: data.shopId,
            profileId: token,
            status:"active"
          }
        }
      )
    } catch (error) {
       return null
    };
  },

  fetchVideo: async (token) => {
    try {
      return await appDbController.Models.video.findAll({
        where: {
          profileId: token,
          status:"active"
        },raw:true
      })
    } catch (error) {
      return null
    }
  },
   
  allVideos: async (token,data) => {
     try {
        let allVideos= await appDbController.Models.video.findAll({
          where: {
            profileId: {
              [Op.ne]: token
            },
            category:data.category,
            status:"active"
          },raw:true
        })
       for (let i = 0; i < allVideos.length; i++){
         let details = await appDbController.Models.shop.findOne({
           where: {
             id: allVideos[i].shopId,
             status:"active"
           }, raw: true,
           attributes:["whatsappNumber"]
         })
         allVideos[i].whatsappNumber=details.whatsappNumber
       }
        for (let i = 0; i < allVideos.length; i++){
          let watchOrNot = await appDbController.Models.viewedVideos.findOne({
            where: {
              userId: token,
              videoId: allVideos[i].id,
              status:"active"
            },raw:true
          })
          if (watchOrNot != null) {
            allVideos[i].watched=true
          } else {
            allVideos[i].watched=false
          }
        }       
        for (let i = 0; i < allVideos.length; i++){
          let savedVideos = await appDbController.Models.saveVideos.findOne({
            where: {
              userId: token,
              videoId: allVideos[i].id,
              status:"active"
            },raw:true
          })
          if (savedVideos != null) {
            allVideos[i].savedAlready=true
          } else {
            allVideos[i].savedAlready=false
          }
        }       
        return allVideos
      } catch (error) {
          return null
      }
  },
    
  mySavedVideos: async (token) => {
    try {
      const myVideos= await appDbController.Models.saveVideos.findAll({
        where: {
          userId: token,
          status:"active"
        },raw:true
      })
      let ids = []
      ids = myVideos.map((s) => s.videoId)
      const mySavedVideos = await appDbController.Models.video.findAll({
        where: {
          id: ids,
          status:"active"
        },
        raw: true,
      })
      for (let i = 0; i < mySavedVideos.length; i++){
        let viewedVideos = await appDbController.Models.viewedVideos.findOne({
          where: {
            userId: mySavedVideos[i].profileId,
            videoId: mySavedVideos[i].id,
            status:"active"            
          }
        })
        if (viewedVideos != null) {
          mySavedVideos[i].watched=true
        } else {
          mySavedVideos[i].watch=false
        }
        mySavedVideos[i].savedAlready=true
      }
      for (let i = 0; i < mySavedVideos.length; i++){
        let shopDetails = await appDbController.Models.shop.findOne({
          where: {
            id:mySavedVideos[i].shopId,
            status:"active"            
          }
        })
        if (shopDetails != null) {
          mySavedVideos[i].whatsappNumber=shopDetails.whatsappNumber
        } else {
          mySavedVideos[i].whatsappNumber=shopDetails.whatsappNumber
        }
      }
      return mySavedVideos
    } catch (error) {
      console.log(error)
      return null
    }
  },
    
  videoCounts: async (data) => {
    try {
      let mySavedVideos
      for (let i = 0; i < data.length; i++)
      {
        mySavedVideos = await appDbController.Models.viewedVideos.count({
          where: {
            videoId: data[i].id,
            status:"active"
        },
        raw: true,
        })
        data[i].views = mySavedVideos || 0
      }
      
      return data
    } catch (error) {
      return null
    }
  },
    
  videoCountsDetails: async (token,data) => {
    try {
        let myViewedVideos=  await appDbController.Models.viewedVideos.count({
          where: {
            userId:token,
            videoId: data.id,
            status:"active"
        },
        raw: true,
        })
        let myViewedVideosStatus=  await appDbController.Models.viewedVideos.findOne({
          where: {
            userId:token,
            videoId: data.id,
            status:"active"
        },
        raw: true,
        })
      let watched
        if (myViewedVideosStatus != null) {
          watched=true
        }
        else {
          watched=false
        }
      let mySavedVideos = await appDbController.Models.saveVideos.findOne({
        where: {
            userId:token,
            videoId: data.id,
            status:"active"      
        }
      })
      let savedStatus
      if (mySavedVideos != null) {
        savedStatus=true
      }
      else {
        savedStatus=false
      }
      let shopDetails = await appDbController.Models.shop.findOne({
        where: {
          id:data.shopId,
          status:"active"
        }
      })
      let whatsappNumber
      if (shopDetails != null) {
        whatsappNumber = shopDetails.whatsappNumber
      }
      else {
        whatsappNumber=null
      }
        data.views = myViewedVideos || 0
        data.savedAlready=savedStatus
        data.watched = watched
        data.whatsappNumber=whatsappNumber
    } catch (error) {
      return null
    }
  },

  checkVideoById: async (data) => {
    try {
      return await appDbController.Models.video.findOne({
        where:
        {
          id: data.videoId,
          status:"active"
        },
        raw:true
      })
    } catch (error) {
      return null
    }
  },

  checkSaveVideos: async (token, data) => {
    try {
      return await appDbController.Models.saveVideos.findOne({
        where:
        {
          userId: token,
          videoId: data.videoId,
        }
      })
    } catch (error) {
      return null
    }
  },

  saveVideos: async (token, data) => {
    try {
      return await appDbController.Models.saveVideos.create({
        userId: token,
        videoId: data.videoId,
        status:"active"
      })
    } catch (error) {
      return null
    }
  },

  updateSaveVideos: async (token, data) => {
    try {
      const update = await appDbController.Models.saveVideos.update(
        {
        status:data.status
      },
      {
        where: {
          userId: token,
          videoId:data.videoId
        }
        })
      if (update[0] != 0) {
        return "Updated"
      } else {
        throw Error.InternalError("Failed to update")
      }
    } catch (error) {
      return null
    }
  },

  fetchMyViewedVideos: async (token) => {
    try {
      const myVideos= await appDbController.Models.viewedVideos.findAll({
        where: {
          userId: token,
          status:"active"
        },raw:true
      })
      let ids = []
      ids = myVideos.map((s) => s.videoId)
      let mySavedVideos = await appDbController.Models.video.findAll({
        where: {
          id: ids,
          status:"active"
        },
        raw: true,
      })
      for (let i = 0; i < mySavedVideos.length; i++){
        let shopDetails = await appDbController.Models.shop.findOne({
        where: {
          id: mySavedVideos[i].shopId,
          status:"active"
        },
        raw: true,
        })
        console.log("shopDetails ",shopDetails)
        mySavedVideos[i].whatsappNumber=shopDetails.whatsappNumber
      }
      
        for (let i = 0; i < mySavedVideos.length; i++){
          let savedVideos = await appDbController.Models.saveVideos.findOne({
            where: {
              userId: token,
              videoId: mySavedVideos[i].id,
              status:"active"
            },raw:true
          })
          if (savedVideos != null) {
            mySavedVideos[i].savedAlready=true
          } else {
            mySavedVideos[i].savedAlready=false
          }
          mySavedVideos[i].watched=true
        }  
      return mySavedVideos
    } catch (error) {
      return null
    }
  },

  checkViewedVideos: async (token, data) => {
    try {
      return await appDbController.Models.viewedVideos.findOne({
        where:
        {
        userId: token,
        videoId: data.videoId,
        status: "active"
        }
      })
    } catch (error) {
      return null
    }
  },

  viewedVideos: async (token, data) => {
    try {
      return await appDbController.Models.viewedVideos.create({
        userId: token,
        videoId: data.videoId,
        status:"active"
      })
    } catch (error) {
      return null
    }
  },

  pointsUpdate: async (token, points) => {
    try {
      return await appDbController.Models.profile.update(
        {
        points:points
        },
        {
          where: {
            id: token,
            status: "active"
        }
      })
    } catch (error) {
      return null
    }
  },

  search: async (token, data) => {
    try {
    
      if (data.input == "all"){
        return await appDbController.Models.shop.findAll({
          where: {
            // profileId: {
            //   [Op.ne]: token
            // },
              status: "active",
          }
          });
      }
      else{
        return await appDbController.Models.shop.findAll({
        where: {
          // profileId: {
          //   [Op.ne]: token
          // },
          [Op.or]: [
            { shopName: { [Op.like]: `%${data.input}%` } },
            { category: { [Op.like]: `%${data.input}%` } },
            // { category: { [Op.like]: `%${data.category}%`||`%${data.input}%` } },
            { description: { [Op.like]: `%${data.input}%` } }
            ],
            status: "active",
          },
          raw:true
        });
      }    
    } catch (error) {
      return null
    }
  }

}

appDbController.Notifications = {
  
  fetchNotificationPreference: async (token) => {
    try {
      return  await appDbController.Models.notificationPreferences.findOne({
        where: {
          userId: token,
        },raw:true
      });
     
    } catch (error) {
      return null
    }
  },
  
  fetchNotificationPreferencesForShopUsers: async (token) => {
    try {
      let preferenceMatched= await appDbController.Models.notificationPreferences.findAll({
        where: {
          userId: {
            [Op.ne]: token
          },
          enableNotifications: true,
          newShop:true
        },
        attributes: ["userId"]
      });
      let ids = []
      ids=preferenceMatched.map(v=>v.userId)
      let preferenceMatchedUsers = await appDbController.Models.profile.findAll({
        where: {
          id: {
            [Op.in]: ids
          },
          status: "active",
        },
        raw: true,
        attributes:["fcmToken"]
      })
      return { preferenceMatchedUsers:preferenceMatchedUsers,ids:ids }
    } catch (error) {
      throw Error.SomethingWentWrong();
    }
  },
  
  fetchNotificationPreferencesForVideoUsers: async (token) => {
    try {
      let preferenceMatched= await appDbController.Models.notificationPreferences.findAll({
        where: {
          userId: {
            [Op.ne]: token
          },
          enableNotifications: true,
          newVideo:true
        },
        attributes: ["userId"]
      });
      let ids = []
      ids=preferenceMatched.map(v=>v.userId)
      let preferenceMatchedUsers = await appDbController.Models.profile.findAll({
        where: {
          id: {
            [Op.in]: ids
          },
          status: "active",
        },
        raw: true,
        attributes:["fcmToken"]
      })
      return {preferenceMatchedUsers:preferenceMatchedUsers,ids:ids}
    } catch (error) {
      throw Error.SomethingWentWrong();
    }
  },

  createNotificationPreference: async (data) => {
    try {
      return await appDbController.Models.notificationPreferences.create(
        {
          userId: data?.userId||data,
          enableNotifications: data.enableNotifications,
          savedVideo: data.savedVideo,
          newVideo: data.newVideo,
          newShop: data.newShop,
        },
        { raw: true }
      );
    } catch (error) {
      return null
    }
  },

  updateNotificationPreference: async (data) => {
    try {
      return await appDbController.Models.notificationPreferences.update(
        {
          enableNotifications: data.enableNotifications,
          savedVideo: data.savedVideo,
          newVideo: data.newVideo,
          newShop: data.newShop,
        },
        {
          where: {
            userId: data?.userId,
          },
        }
      );
    } catch (error) {
      return null
    }
  },

  fetchNotifications: async (data) => {
    try {
      return await appDbController.Models.pushMessaging.findAll({
        where: {
          userId: data,
        },
        raw: true,
        attributes: {
          exclude:["updatedAt"]
        }
      });
    } catch (error) {
      return null
    }
  },

  notificationCount: async (data) => {
    try {
      return await appDbController.Models.pushMessaging.count({
        where: {
          userId: data,
          readStatus:"unread"
        },
        raw: true
      });
    } catch (error) {
      console.log(error)
      return null
    }
  },

  notificationById: async (token,data) => {
    try {
      return await appDbController.Models.pushMessaging.findOne({
        where: {
          userId: token,
          id:data.notificationId
        },
        raw: true
      });
    } catch (error) {
      return null
    }
  },

  notificationsReadStatus: async (data) => {
    try {
      return await appDbController.Models.pushMessaging.update(
        {
          readStatus: "read"
        },
        {
          where: {
            userId: data,
          },
        }
      );
      // if (readingStatus[0] != 0) {
      //   return "Updated";
      // } else {
      //   return "Unable to update";
      // }
    } catch (error) {
      return null
    }
  },

  addPushMessageBulk: async (data) => {
    try {
      // return await appDbController.Models.pushMessaging.findOrCreate({
      //   where: {
      //     userId: data?.userId || 0,
      //     msgTitle: data?.msgTitle || data.title,
      //     msgImage: data?.msgImage || null,
      //     msgLink: data?.msgLink || null,
      //     msgDesc: data?.msgDesc || data.description,
      //     msgType: data?.msgType,
      //     msgStatus: data?.msgStatus,
      //   }
      // });
      const payload = data.userId.map(userId => ({
        userId,
        msgTitle: data.msgTitle,
        msgImage: data.msgImage || null,
        msgLink: data.msgLink || null,
        msgDesc: data.msgDesc || null,
        msgType: data.msgType,
        msgStatus: data.msgStatus,
      }));
      // return await appDbController.Models.pushMessaging.bulkCreate(payload);
      const records = await appDbController.Models.pushMessaging.bulkCreate(payload);

      // Boolean flag
      const checkExists = records.length > 0;
    
      return [records, checkExists];
    } catch (error) {
      console.log(error)
      return null
    }
  },

  addPushMessage: async (data) => {
    try {
      return await appDbController.Models.pushMessaging.findOrCreate({
        where: {
          userId: data?.userId || 0,
          msgTitle: data?.msgTitle || data.title,
          msgImage: data?.msgImage || null,
          msgLink: data?.msgLink || null,
          msgDesc: data?.msgDesc || data.description,
          msgType: data?.msgType,
          msgStatus: data?.msgStatus,
        }
      });
     
    } catch (error) {
      return null
    }
  },

  notificationOpenStatus: async (token, data) => {
    try {
      return await appDbController.Models.pushMessaging.update(
        {
          openStatus: "opened"
        },
        {
          where: {
            userId: token,
            id:data.notificationId
          },
        }
      );
    } catch (error) {
      return null
    }
  },

  addReview: async (token, data) => {
    try {
      return await appDbController.Models.pushMessaging.update(
        {
          openStatus: "opened"
        },
        {
          where: {
            userId: token,
            id:data.notificationId
          },
        }
      );
    } catch (error) {
      return null
    }
  },


}

