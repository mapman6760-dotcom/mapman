import require from "requirejs";
var CryptoJS = require("crypto-js");
const path = require("path");
import fs from "fs";
const __dirname = path.resolve();
import * as Error from "../../../Core/errors/ErrorConstant.js";
import { authentications } from "../../../Core/utils/jwt.js";
import { appDbController } from "../../../Core/database/Controller/appDbController.js";
import moment from "moment";
import capitalize from "lodash/capitalize.js";
import { FirebaseService } from "../../../Core/utils/notifier.js";
import { category } from "../../../Core/database/models/shopModel.js";
import { executeRazorpayPayout } from "../../../Core/utils/razorpay.js";
const excelToJson = require('convert-excel-to-json');
import { adminDbController } from "../../../Core/database/Controller/adminDbController.js";
import { messagingFunction } from "../../../Core/utils/message.js";
export class appMiddleware { }

const handleShopNotification = async (token, body, images, registerShopId) => {
    try {
        const fetchPreferenceWithIds = await appDbController.Notifications.fetchNotificationPreferencesForShopUsers(token);
        if (fetchPreferenceWithIds && fetchPreferenceWithIds.preferenceMatchedUsers && fetchPreferenceWithIds.preferenceMatchedUsers.length !== 0) {
            const tokenSet = new Set();
            for (const item of fetchPreferenceWithIds.preferenceMatchedUsers) {
                try {
                    const tokens = JSON.parse(item.fcmToken || '[]');
                    tokens.forEach(t => tokenSet.add(t));
                } catch (e) {
                    console.log("Invalid JSON:", item.fcmToken);
                }
            }
            const uniqueTokens = [...tokenSet];
            const notify = {
                userId: fetchPreferenceWithIds.ids,
                token: uniqueTokens,
                msgTitle: `${capitalize(body.shopName)}`,
                msgImage: images.shopImage,
                msgDesc: "New shop has been added",
                msgType: "newShop",
                msgStatus: "accepted",
                msgLink: registerShopId,
            };
            const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
            if (checkExists === true && uniqueTokens.length !== 0) {
                await FirebaseService.sendNotifications(notify);
            }
        }
    } catch (err) {
        console.error("Error handling shop register notification:", err);
    }
};

const handleVideoNotification = async (token, body, video, videoUploadId) => {
    try {
        const fetchPreferenceWithIds = await appDbController.Notifications.fetchNotificationPreferencesForVideoUsers(token);
        if (fetchPreferenceWithIds && fetchPreferenceWithIds.preferenceMatchedUsers && fetchPreferenceWithIds.preferenceMatchedUsers.length !== 0) {
            const tokenSet = new Set();
            for (const item of fetchPreferenceWithIds.preferenceMatchedUsers) {
                try {
                    const tokens = JSON.parse(item.fcmToken || '[]');
                    tokens.forEach(t => tokenSet.add(t));
                } catch (e) {
                    console.log("Invalid JSON:", item.fcmToken);
                }
            }
            const uniqueTokens = [...tokenSet];
            const notify = {
                userId: fetchPreferenceWithIds.ids,
                token: uniqueTokens,
                msgTitle: `${capitalize(body.videoTitle)}`,
                msgImage: video,
                msgDesc: "New video has been added",
                msgType: "newVideo",
                msgStatus: "accepted",
                msgLink: videoUploadId,
            };
            const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
            if (checkExists === true && uniqueTokens.length !== 0) {
                await FirebaseService.sendNotifications(notify);
            }
        }
    } catch (err) {
        console.error("Error handling video register notification:", err);
    }
};


appMiddleware.App = {

    addNewCategory: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const fetchCategory = await appDbController.Profile.fetchAllCategories(token)
            if (fetchCategory != null && fetchCategory != undefined && fetchCategory.length != 0) {
                if(fetchCategory.length<=4)
                {
                const addCategory = await appDbController.Profile.addCategory(token, body)
                if (addCategory != null && addCategory != undefined && Object.keys(addCategory).length != 0) {
                    return "Your category added successfully"
                } else {
                    throw Error.InternalError("Failed to add category")
                }
                } else {
                    throw Error.SomethingWentWrong("You already added 5 categoriies! Please remove one category to add additional categories!")
                }
            } else {
                const addCategory = await appDbController.Profile.addCategory(token, body)
                if (addCategory != null && addCategory != undefined && Object.keys(addCategory).length != 0) {
                    return "Your category added successfully"
                } else {
                    throw Error.InternalError("Failed to add category")
                }
                // throw Error.SomethingWentWrong("Categories not found")
            }
        } else {
            return "Profile not found";
        }
    },

    deleteCategory: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const fetchCategory = await appDbController.Profile.fetchSingleCategory(token, body)
            if (fetchCategory != null && fetchCategory != undefined && Object.keys(fetchCategory).length != 0) {
                const deleteCategory = await appDbController.Profile.deleteSingleCategory(token, body)
                if (fetchCategory != null && fetchCategory != undefined ) {
                    return "Your category deleted successfully"
                } else {
                    throw Error.SomethingWentWrong("Failed to delete the category")
                }
            } else {
                throw Error.InternalError("Category not found")
            }
        } else {
            return "Profile not found";
        }
    },

   addDeviceId: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null) {
            if (typeof fetchUser.fcmToken == "string") {
                var fcmToken = JSON.parse(fetchUser.fcmToken);
                fcmToken.push(body.fcmToken);
                body.fcmToken = fcmToken;
                body.fcmToken = JSON.stringify(body.fcmToken);
                const updateDeviceId = await appDbController.Auth.addDeviceId(token,body);
                if (updateDeviceId != null && updateDeviceId != undefined && updateDeviceId[0] != 0) {
                    return "Device Id Added";
                } else {
                    throw Error.InternalError("Failed to add Device Id");
                }
            } else {
                var fcmToken = [];
                fcmToken.push(body.fcmToken);
                body.fcmToken = fcmToken;
                body.fcmToken = JSON.stringify(body.fcmToken);
                const updateDeviceId = await appDbController.Auth.addDeviceId(token,body);
                if (updateDeviceId != null && updateDeviceId != undefined && updateDeviceId[0] != 0) {
                    return "Device Id Added";
                } else {
                    throw Error.InternalError("Failed to add Device Id");
                }
            }
        } else {
            return [];
        }
    },

    updateProfile: async ({ token, body, image }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            if (image != null) {
                image=image
            } else {
                image=fetchUser.profilePic
            }
            const updateProfile = await appDbController.Profile.updateProfile(token,body,image);
            if (updateProfile != null && updateProfile != undefined && updateProfile[0] != 0) {
                return "Profile updated";
            } else {
                throw Error.InternalError("Failed to update profile");
            }            
        } else {
            return "Profile not found";
        }
    },
    
    getProfile: async ({ token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            return fetchUser             
        } else {
           return "Profile not found";
        }    
    },
    
    analytics: async ({ token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            let totalVideos = await appDbController.Profile.totalVideos(token)
            if (totalVideos != null && totalVideos != undefined && totalVideos.length != 0) {
              totalVideos=totalVideos   
            } else {
                totalVideos=[]
            }
            const totalVideoIds=totalVideos.map(v=>v.id)
            let videoViews = await appDbController.Profile.totalViews(token, totalVideoIds)        
              const viewCountMap = videoViews.reduce((acc, v) => {
                acc[v.videoId] = (acc[v.videoId] || 0) + 1;
                return acc;
              }, {});
              const videosWithViews = totalVideos.map(video => ({
                ...video,
                viewCount: viewCountMap[video.id] || 0
              }));              
            return {totalVideos:videosWithViews,totalViews:videoViews.length}
        } else {
           return "Profile not found";
        }    
    },

    search: async ({ token, query }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const search = await appDbController.Shop.search(token, query)
            if (search != null && search != undefined && search.length != 0) {
                return search
            } else {
                return []
            }
        } else {
            return "Profile not found";
        }
    },

    nonauthendicateSearch: async ({ query }) => {
            const nonauthendicateSearch = await appDbController.Shop.nonauthendicateSearch(query)
            if (nonauthendicateSearch != null && nonauthendicateSearch != undefined && nonauthendicateSearch.length != 0) {
                return nonauthendicateSearch
            } else {
                return []
            }
    },
  
    shopRegister: async ({ body, token, images }) => {
        console.log("body is ",body)
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {                  
            if (body.type == "update") {
                console.log("update")
                const checkShop = await appDbController.Shop.getShopWithToken(token,body)
                if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                if (images.shopImage != null) {
                    images.shopImage=images.shopImage
                } else {
                    images.shopImage=checkShop.shopImage
                }

                if (images.image1 != null) {
                    images.image1=images.image1
                } else {
                    images.image1=checkShop.image1
                }

                if (images.image2 != null) {
                    images.image2=images.image2
                } else {
                    images.image2=checkShop.image2
                }

                if (images.image3 != null) {
                    images.image3=images.image3
                } else {
                    images.image3=checkShop.image3
                }

                if (images.image4 != null) {
                    images.image4=images.image4
                } else {
                    images.image4=checkShop.image4
                }
                const shopUpdate = await appDbController.Shop.shopUpdate(token, body, images)
               return shopUpdate
                } else {
                    return Error.SomethingWentWrong("Shop not found")
                }
            } else if (body.type == "add") {
                console.log("add")
                // else {
                const getShops = await appDbController.Shop.getTokenShops(token)
                //GEt all the token shops
                if (getShops != null && getShops != undefined && getShops.length != 0) {
                    if (getShops.length <=9) {
                        const registerShop = await appDbController.Shop.registerShop(token, body, images)
                        console.log("register shop first",registerShop)
                        if (registerShop != null && registerShop != undefined && Object.keys(registerShop).length != 0) {
                            // const fetchPreferenceWithIds = await appDbController.Notifications.fetchNotificationPreferencesForShopUsers(token)
                            // if (fetchPreferenceWithIds.preferenceMatchedUsers != null && fetchPreferenceWithIds.preferenceMatchedUsers != undefined && fetchPreferenceWithIds.preferenceMatchedUsers.length != 0) {
                            //     const tokenSet = new Set();
                            //     for (const item of fetchPreferenceWithIds.preferenceMatchedUsers) {
                            //         try {
                            //             const tokens = JSON.parse(item.fcmToken || '[]');
                            //             tokens.forEach(t => tokenSet.add(t));
                            //         } catch (e) {
                            //             console.log("Invalid JSON:", item.fcmToken);
                            //         }
                            //     }
                            //     const uniqueTokens = [...tokenSet];
                            //     var notify = {
                            //         userId: fetchPreferenceWithIds.ids,
                            //         token: uniqueTokens,
                            //         msgTitle: `${capitalize(body.shopName)}`,
                            //         msgImage: images.shopImage,
                            //         msgDesc: "New shop has been added",
                            //         msgType: "newShop",
                            //         msgStatus: "accepted",
                            //         msgLink: registerShop.id,
                            //         // msgLink: '/notifications',
                            //     };
                            //     if (uniqueTokens != null && uniqueTokens != undefined && uniqueTokens.length != 0) {
                            //         const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                            // 
                            //         if (checkExists == true) {
                            //             await FirebaseService.sendNotifications(notify);
                            //             return "Shop registered successfully"
                            //         }
                            //         else {
                            //             return "Shop registered successfully"
                            //         }
                            //     }
                            //     else {
                            //         const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                            //         return "Shop registered successfully"
                            //     }
                            // } else {
                            //     // console.log("femtoken not found")
                            //     // const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                            //     // if (checkExists == true) {
                            //     //   await FirebaseService.sendNotifications(notify);
                            //     //   return "Shop registered successfully"
                            //     // }
                            //     // else {
                            //     //     return "Shop registered successfully"
                            //     // }
                            //     return "Shop registered successfully"
                            // }
                            handleShopNotification(token, body, images, registerShop.id);
                            return "Shop registered successfully";
                        } else {
                            console.log("register")
                            throw Error.InternalError("Failed to register the shop")
                        }
                    } else {
                        throw Error.SomethingWentWrong("You already added 10 shops!..")
                    }                  
                }
                //If token shops not found add the shop
                else {
                    const registerShop = await appDbController.Shop.registerShop(token, body, images)
                    console.log("register shop second",registerShop)
                if (registerShop != null && registerShop != undefined && Object.keys(registerShop).length != 0) {
                    // const fetchPreferenceWithIds = await appDbController.Notifications.fetchNotificationPreferencesForShopUsers(token)
                    // if (fetchPreferenceWithIds.preferenceMatchedUsers != null && fetchPreferenceWithIds.preferenceMatchedUsers != undefined && fetchPreferenceWithIds.preferenceMatchedUsers.length != 0) {
                    //     const tokenSet = new Set();
                    //     for (const item of fetchPreferenceWithIds.preferenceMatchedUsers) {
                    //       try {
                    //         const tokens = JSON.parse(item.fcmToken || '[]');
                    //         tokens.forEach(t => tokenSet.add(t));
                    //       } catch (e) {
                    //         console.log("Invalid JSON:", item.fcmToken);
                    //       }
                    //     }                        
                    //     const uniqueTokens = [...tokenSet];                          
                    //     var notify = {
                    //         userId: fetchPreferenceWithIds.ids,
                    //         token: uniqueTokens,
                    //         msgTitle: `${capitalize(body.shopName)}`,
                    //         msgImage:images.shopImage,
                    //         msgDesc: "New shop has been added",
                    //         msgType: "newShop",
                    //         msgStatus: "accepted",
                    //         msgLink: registerShop.id,
                    //         // msgLink: '/notifications',
                    //     };                       
                    //     if (uniqueTokens != null && uniqueTokens != undefined && uniqueTokens.length != 0) {
                    //         const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                    //         
                    //         if (checkExists == true) {
                    //           await FirebaseService.sendNotifications(notify);
                    //           return "Shop registered successfully"
                    //         }
                    //         else {
                    //             return "Shop registered successfully"
                    //         }
                    //       }
                    //       else { 
                    //         const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                    //         return "Shop registered successfully"
                    //       }
                    // } else {
                    //     // const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                    //     // if (checkExists == true) {
                    //     //   await FirebaseService.sendNotifications(notify);
                    //     //   return "Shop registered successfully"
                    //     // }
                    //     // else {
                    //     //     return "Shop registered successfully"
                    //     // }
                    //     return "Shop registered successfully"
                    // }
                    handleShopNotification(token, body, images, registerShop.id);
                    return "Shop registered successfully";
                } else {
                    throw Error.InternalError("Failed to register the shop")
                }  
                } 
            } else {
                throw Error.SomethingWentWrong("Select update/add shop")
            } 
        } else {
            return "Profile not found";
        }
    },
    
    deleteShop: async ({token,query}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getShopWithToken(token,query)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                console.log("checkShop.id ",checkShop.id)
                console.log("query.shopId",query.shopId)
                if(checkShop.id==query.shopId)
                {
                const shopUpdate = await appDbController.Shop.deleteShop(token, query)                
                    if (shopUpdate != null && shopUpdate != undefined) {
                    return shopUpdate
                }
                else {
                    return shopUpdate
                }
                } else {
                    throw Error.InternalError("Permission denied for deleting this shop")
                }
            } else {
              return "Register shop/Shop not active now"
            }          
        } else {
            return "Profile not found";
        }
    },
    
    deleteShopImage: async ({ body, token}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getShopById(body)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
               const shopUpdate = await appDbController.Shop.deleteShopImage(token,body)
                if (shopUpdate != null && shopUpdate != undefined && shopUpdate[0] != 0) {
                    return "Image deleted"
                }
                else {
                    throw Error.InternalError("Failed to delete the image")
            }} else {
              return "Register shop/Shop not active now"
            }          
        } else {
            return "Profile not found";
        }
    },
    
    fetchShop: async ({ token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getTokenShops(token)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                return checkShop
            } else {
                return []
            }          
        } else {
            return "Profile not found";
        }
    },
    
    getShopById: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getShopById(body)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                const shopVideos = await appDbController.Shop.shopVideos(body)
                if (shopVideos != null && shopVideos != undefined && shopVideos.length != 0) {
                    const savedShop = await appDbController.Shop.checkSavedShop(token, body)
                    if (savedShop != null && savedShop != undefined && Object.keys(savedShop).length != 0) {
                        return {shop:checkShop,shopVideos:shopVideos,shopSavedAlready:true}
                    } else {
                        return {shop:checkShop,shopVideos:shopVideos,shopSavedAlready:false}

                    }
                }
                else {
                    return {shop:checkShop,shopVideos:[]}
                }
            } else {
                return "Shop not found"
            }          
        } else {
            return "Profile not found";
        }
    },

    saveShop: async ({ token, body }) => {
        console.log("body ",body)
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShopById = await appDbController.Shop.getShopById(body)
            if (checkShopById != null && checkShopById != undefined && Object.keys(checkShopById).length != 0) {
                const checkShop = await appDbController.Shop.checkShop(token, body)
                console.log("mahdu ",checkShop)
                if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                    console.log("update ")
                const saveShop = await appDbController.Shop.updateSaveShop(token,body)
                if (saveShop != null && saveShop != undefined && saveShop.length != 0) {
                    return saveShop
                }
                else {
                    throw Error.InternalError("Failed to update the shop")
                    }
                }
                else {
                    console.log("create")
                const saveShop = await appDbController.Shop.saveShop(token,body)
                if (saveShop != null && saveShop != undefined && saveShop.length != 0) {
                    return "Shop saved"
                }
                else {
                    throw Error.InternalError("Failed to save the shop")
                }
            } 
            } else {
                return "Shop not found"
            }          
        } else {
            return "Profile not found";
        }
    },

    fetchSavedShop: async ({token,query}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            // const page = Number(query.page) || 1;
            // const pageSize = process.env.PAGINATION_PAGE_SIZE;
            // const limit = page * pageSize;
            // let data = {
            //     limit: limit,
            // }

            const page = Number(query.page) || 1;

const pageSize = Number(process.env.PAGINATION_PAGE_SIZE) || 10;

const offset = (page - 1) * pageSize;

let data = {
  limit: pageSize,
  offset: offset
};
                const fetchSavedShops=await appDbController.Shop.fetchSavedShops(token,data)
                if (fetchSavedShops != null && fetchSavedShops != undefined && (fetchSavedShops).length != 0) {
                    return fetchSavedShops
                } else {
                    return []
                }                        
        } else {
            return "Profile not found";
        }
    },

    videoRegister: async ({ body, token, video, thumbnail }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getMyShop(token,body)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                const videoUpload=await appDbController.Shop.videoUpload(body,token,video,thumbnail)
                // if (videoUpload != null && videoUpload != undefined && Object.keys(videoUpload).length != 0) {
                //     // return "Video uploaded"
                // }
                if (videoUpload != null && videoUpload != undefined && Object.keys(videoUpload).length != 0) {
                    // const fetchPreferenceWithIds = await appDbController.Notifications.fetchNotificationPreferencesForVideoUsers(token)
                    // if (fetchPreferenceWithIds.preferenceMatchedUsers != null && fetchPreferenceWithIds.preferenceMatchedUsers != undefined && fetchPreferenceWithIds.preferenceMatchedUsers.length != 0) {
                    //     const tokenSet = new Set();
                    //     for (const item of fetchPreferenceWithIds.preferenceMatchedUsers) {
                    //       try {
                    //         const tokens = JSON.parse(item.fcmToken || '[]');
                    //         tokens.forEach(t => tokenSet.add(t));
                    //       } catch (e) {
                    //         console.log("Invalid JSON:", item.fcmToken);
                    //       }
                    //     }                        
                    //     const uniqueTokens = [...tokenSet];                          
                    //     var notify = {
                    //         userId: fetchPreferenceWithIds.ids,
                    //         token: uniqueTokens,
                    //         msgTitle: `${capitalize(body.videoTitle)}`,
                    //         msgImage:video,
                    //         msgDesc: "New video has been added",
                    //         msgType: "newVideo",
                    //         msgStatus: "accepted",
                    //         msgLink:videoUpload.id,
                    //         // msgLink: '/notifications',
                    //       };                       
                    //       if (uniqueTokens != null && uniqueTokens != undefined && uniqueTokens.length != 0) {
                    //         const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                    //         if (checkExists == true) {
                    //           await FirebaseService.sendNotifications(notify);
                    //           return "Video uploaded"
                    //         }
                    //         else {
                    //             return "Video uploaded"
                    //         }
                    //       }
                    //       else { 
                    //         const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                    //         return "Video uploaded"
                    //       }
                    // } else {
                    //     // const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                    //     // if (checkExists == true) {
                    //     //   await FirebaseService.sendNotifications(notify);
                    //     //   return "Video uploaded"
                    //     // }
                    //     // else {
                    //     //     return "Video uploaded"
                    //     // }
                    //     return "Video uploaded"
                    // }
                    handleVideoNotification(token, body, video, videoUpload.id);
                    return "Video uploaded";
                }
                else {
                   throw Error.InternalError("Failed to upload the video")
                }
            } else {
                return "Shop not active now/Please register shop"
            }              
        } else {
            return "Profile not found";
        }
    },

    updateVideo: async ({ body, token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkVideo = await appDbController.Shop.fetchVideoId(token,body)
            if (checkVideo != null && checkVideo != undefined && Object.keys(checkVideo).length != 0) {
                const videoUpload=await appDbController.Shop.updateVideoDetails(body,token)
                if (videoUpload != null && videoUpload != undefined && videoUpload[0] != 0) {
                    return "Details updated"
                } else {
                   throw Error.InternalError("Failed to update the details")
                }
            } else {
                return "Video not found"
            }              
        } else {
            return "Profile not found";
        }
    },

    deleteVideo: async ({ body, token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkVideo = await appDbController.Shop.fetchVideoId(token,body)
            if (checkVideo != null && checkVideo != undefined && Object.keys(checkVideo).length != 0) {
                const deleteVideo=await appDbController.Shop.deleteVideo(body,token)
                if (deleteVideo != null && deleteVideo != undefined && deleteVideo[0] != 0) {
                    return "Video deleted"
                } else {
                   throw Error.InternalError("Failed to delete the video")
                }
            } else {
                return "Video not found"
            }              
        } else {
            return "Profile not found";
        }
    },

    replaceVideo: async ({ body, token, video }) => {
        
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkVideo = await appDbController.Shop.fetchVideoId(token,body)
            if (checkVideo != null && checkVideo != undefined && Object.keys(checkVideo).length != 0) {
                const replaceVideo=await appDbController.Shop.replaceVideo(token,body,video)
               return replaceVideo
            } else {
                return "Video not found"
            }              
        } else {
            return "Profile not found";
        }
    },

    fetchVideo: async ({token}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getShop(token)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                const fetchVideo=await appDbController.Shop.fetchVideo(token)
                if (fetchVideo != null && fetchVideo != undefined && Object.keys(fetchVideo).length != 0) {
                    // return fetchVideo
                    const videoViews = await appDbController.Shop.videoCounts(fetchVideo)
                    if (videoViews != null && videoViews != undefined) {
                        return fetchVideo
                    }
                    else {
                        return fetchVideo
                    }
                } else {
                    return []
                }
            } else {
                return "Shop not active now/Please register shop"
            }              
        } else {
            return "Profile not found";
        }
    },

    myShopVideos: async ({token,query}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getMyShop(token,query)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                const fetchVideo = await appDbController.Shop.fetchMyVideos(token, query)
                if (fetchVideo != null && fetchVideo != undefined && Object.keys(fetchVideo).length != 0) {
                    // return fetchVideo
                    const videoViews = await appDbController.Shop.videoCounts(fetchVideo)
                    if (videoViews != null && videoViews != undefined) {
                        return fetchVideo
                    }
                    else {
                        return fetchVideo
                    }
                } else {
                    return []
                }
            } else {
                return "Shop not active now/Please register shop"
            }              
        } else {
            return "Profile not found";
        }
    },

    fetchVideoById: async ({token,query}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
                const fetchVideo=await appDbController.Shop.checkVideoById(query)
                if (fetchVideo != null && fetchVideo != undefined && Object.keys(fetchVideo).length != 0) {
                    // return fetchVideo
                    const videoViews = await appDbController.Shop.videoCountsDetails(token,fetchVideo)
                    if (videoViews != null && videoViews != undefined) {
                        return fetchVideo
                    }
                    else {
                        return fetchVideo
                    }
                } else {
                    return []
                }
                          
        } else {
            return "Profile not found";
        }
    },

    allVideos: async ({token,query}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            //const checkShop = await appDbController.Shop.getShop(token)
            // if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
            // const page = Number(query.page) || 1;
            // const pageSize = process.env.PAGINATION_PAGE_SIZE;
            // const limit = page * pageSize;
            const page = Number(query.page) || 1;

const pageSize = Number(process.env.PAGINATION_PAGE_SIZE) || 10;

const offset = (page - 1) * pageSize;
const limit=pageSize

                let allVideos=await appDbController.Shop.allVideos(token,query,limit,offset)
                console.log("allvideos",allVideos)
                if (allVideos != null && allVideos != undefined && Object.keys(allVideos).length != 0) {
                    let videoViews = await appDbController.Shop.videoCounts(allVideos)
                    if (videoViews != null && videoViews != undefined) {
                        // videoViews={...videoViews,points:fetchUser.points}
                        return videoViews
                        // return {videoViews,points:fetchUser.points}
                    }
                    else {
                        allVideos = allVideos.map(v => ({
                            ...v,
                            views: 0,
                        }));            
                        // allVideos={...allVideos,points:fetchUser.points}
                        return allVideos
                    }
                } else {
                    return []
                }
            // } else {
            //     return "Shop not active now"
            // }              
        } else {
            return "Profile not found";
        }
    },

    saveVideos: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkVideo=await appDbController.Shop.checkVideoById(body)
            if (checkVideo != null && checkVideo != undefined && Object.keys(checkVideo).length != 0)
            {
            const checkVideoUser=await appDbController.Profile.getProfile(checkVideo.profileId)
            if (checkVideoUser!=null&&checkVideoUser!=undefined&&Object.keys(checkVideoUser).length!=0)
            {
            //     const checkVideoUserPreference = await appDbController.Notifications.fetchNotificationPreference(checkVideoUser.id)
            //     //Notification preference true
            //    if(checkVideoUserPreference!=null&&checkVideoUserPreference!=undefined&&checkVideoUserPreference.enableNotifications!=false&&checkVideoUserPreference.savedVideo!=false){
            //     let videoCreated = moment(checkVideo.createdAt).fromNow();
            //     let msg
            //     let msgDesc
            //     if(body.status=="active")
            //     {
            //         msg = "saved"
            //         msgDesc=`${capitalize(fetchUser.userName)} saved the video you uploaded ${videoCreated}`
            //     }
            //     else {
            //         msg = "was removed from the saved list."
            //         msgDesc=`${capitalize(fetchUser.userName)} remove the video from the saved list you uploaded ${videoCreated}`
            //     }
            //     const uniqueTokens = checkVideoUser.fcmToken ? Array.from(JSON.parse(checkVideoUser.fcmToken)) : [];
            //     var notify = {
            //         userId: checkVideoUser.id,
            //         token: uniqueTokens,
            //         title: `Your video was ${msg}`,
            //         msgDesc: msgDesc,
            //         msgImage:checkVideo.video,
            //         msgType: "saveVideo",
            //         msgStatus: "accepted",
            //         msgLink: body.videoId,
            //     };
            //     const checkSave = await appDbController.Shop.checkSaveVideos(token, body)
            //     if (checkSave != null && checkSave != undefined && Object.keys(checkSave).length != 0) {
            //     const updateVideos = await appDbController.Shop.updateSaveVideos(token,body)
            //         // return updateVideos
            //         if (uniqueTokens != null && uniqueTokens != undefined && uniqueTokens.length > 0) {
            //             const [fetch, checkExists] = await appDbController.Notifications.addPushMessage(notify);
            //             if (checkExists == true) {
            //               await FirebaseService.sendNotifications(notify);
            //               return updateVideos
            //             }
            //             else {
            //               return updateVideos
            //             }
            //         }
            //         else {
            //             const [fetch, checkExists] = await appDbController.Notifications.addPushMessage(notify);
            //             return updateVideos
            //         }
            //     } else {
            //     const saveVideos = await appDbController.Shop.saveVideos(token,body)
            //     if (saveVideos != null && saveVideos != undefined && Object.keys(saveVideos).length != 0) {
            //         // return "Video saved"
            //         if (uniqueTokens != null && uniqueTokens != undefined && uniqueTokens.length > 0) {
            //             const [fetch, checkExists] = await appDbController.Notifications.addPushMessage(notify);
            //             if (checkExists == true) {
            //               await FirebaseService.sendNotifications(notify);
            //               return "Video saved"
            //             }
            //             else {
            //               return "Video saved"
            //             }
            //         }
            //           else {
            //             const [fetch, checkExists] = await appDbController.Notifications.addPushMessage(notify);
            //             return "Video saved"
            //         }
            //     } else {
            //        throw Error.InternalError("Failed to save the viďoe")
            //     }
            //     }
            //    }
            //     //Notification preference false
            //    else {
            //     const checkSave = await appDbController.Shop.checkSaveVideos(token, body)
            //        if (checkSave != null && checkSave != undefined && Object.keys(checkSave).length != 0) {
            //            const updateVideos = await appDbController.Shop.updateSaveVideos(token, body)
            //            return updateVideos
            //        } else {
            //            const saveVideos = await appDbController.Shop.saveVideos(token, body)
            //            if (saveVideos != null && saveVideos != undefined && Object.keys(saveVideos).length != 0) {
            //                return "Video saved"
            //            } else {
            //                throw Error.InternalError("Failed to save the viďoe")
            //            }
            //        }
                //     }
                const checkSave = await appDbController.Shop.checkSaveVideos(token, body)
                if (checkSave != null && checkSave != undefined && Object.keys(checkSave).length != 0) {
                    const updateVideos = await appDbController.Shop.updateSaveVideos(token, body)
                    return updateVideos
                } else {
                    const saveVideos = await appDbController.Shop.saveVideos(token, body)
                    if (saveVideos != null && saveVideos != undefined && Object.keys(saveVideos).length != 0) {
                        return "Video saved"
                    } else {
                        throw Error.InternalError("Failed to save the viďoe")
                    }
                }
            } else {
                return "This shop profile user not active"
            }
            } else {
                return "This video not found"
            }      
        }else {
            return "Profile not found";
        }
    },

    mySavedVideos: async ({ token,query }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            // const page = Number(query.page) || 1;
            // const pageSize = process.env.PAGINATION_PAGE_SIZE;
            // const limit = page * pageSize;
            // let data = {
            //     limit: limit,
            // }
            const page = Number(query.page) || 1;

const pageSize = Number(process.env.PAGINATION_PAGE_SIZE) || 10;

const offset = (page - 1) * pageSize;

let data = {
  limit: pageSize,
  offset: offset
};
            const myVideos = await appDbController.Shop.mySavedVideos(token, data)
            console.log("myvideos ",myVideos)
            if (myVideos != null && myVideos != undefined && Object.keys(myVideos).length != 0) {
                const videoViews = await appDbController.Shop.videoCounts(myVideos)
                if (videoViews != null && videoViews != undefined) {
                    return myVideos
                }
                else {
                    return myVideos
                }
            } else {
                return [];
            } 
        } else {
            return "Profile not found";
        }
    },

    viewedVideos: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkVideo = await appDbController.Shop.checkVideoById(body)
            if (checkVideo != null && checkVideo != undefined && Object.keys(checkVideo).length != 0) {
                if (checkVideo.profileId != token) {
                    const checkViewedVideos = await appDbController.Shop.checkViewedVideos(token, body)
                    if (checkViewedVideos != null && checkViewedVideos != undefined && Object.keys(checkViewedVideos).length != 0) {
                      return "Video already viewed"
                    } else {         
                              let points=Number(fetchUser.points)+Number(2)
                              const viewedVideos = await appDbController.Shop.viewedVideos(token,body)
                              if (viewedVideos != null && viewedVideos != undefined && Object.keys(viewedVideos).length != 0) {
                                  const pointsUpdate = await appDbController.Shop.pointsUpdate(token, points)
                                  if (pointsUpdate != null && pointsUpdate != undefined && pointsUpdate[0] != 0) {
                                      return "Video viewed and points added"
                                  }else{
                                      throw Error.InternalError("Failed to update the points")
                                  }
                              } else {
                                 throw Error.InternalError("Failed to view the viďeo")
                              }                          
                    } 
                } else {
                    return "Video already viewed"
                }
            }
            else{
                return "Video not found"
             }   
        }else {
            return "Profile not found";
        }

    },

    addPoints: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkVideo = await appDbController.Shop.checkVideoById(body)
            if (checkVideo != null && checkVideo != undefined && Object.keys(checkVideo).length != 0) {
                if (checkVideo.profileId != token) {
                    const checkViewedVideos = await appDbController.Shop.checkViewedVideos(token, body)
                    if (checkViewedVideos != null && checkViewedVideos != undefined && Object.keys(checkViewedVideos).length != 0) {
                      return "Video already viewed"
                    } else {         
                              let points=Number(fetchUser.points)+Number(2)
                              const viewedVideos = await appDbController.Shop.viewedVideos(token,body)
                              if (viewedVideos != null && viewedVideos != undefined && Object.keys(viewedVideos).length != 0) {
                                  const pointsUpdate = await appDbController.Shop.pointsUpdate(token, points)
                                  if (pointsUpdate != null && pointsUpdate != undefined && pointsUpdate[0] != 0) {
                                      return "Video viewed and points added"
                                  }else{
                                      throw Error.InternalError("Failed to update the points")
                                  }
                              } else {
                                 throw Error.InternalError("Failed to view the viďeo")
                              }                          
                    } 
                } else {
                    return "Video already viewed"
                }
            }
            else{
                return "Video not found"
             }   
        }else {
            return "Profile not found";
        }

    },

    fetchMyViewedVideos: async ({ token,query }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            // const page = Number(query.page) || 1;
            // const pageSize = process.env.PAGINATION_PAGE_SIZE;
            // const limit = page * pageSize;
            // let data = {
            //     limit: limit,
            // }
            const page = Number(query.page) || 1;

const pageSize = Number(process.env.PAGINATION_PAGE_SIZE) || 10;

const offset = (page - 1) * pageSize;

let data = {
  limit: pageSize,
  offset: offset
};
            const myVideos = await appDbController.Shop.fetchMyViewedVideos(token,data)
            if (myVideos != null && myVideos != undefined && Object.keys(myVideos).length != 0) {
                const videoViews = await appDbController.Shop.videoCounts(myVideos)
                if (videoViews != null && videoViews != undefined) {
                    return myVideos
                }
                else {
                    return myVideos
                }
            } else {
            return [];
            } 
        } else {
            return "Profile not found";
        }
    },
    
    getCategoryVideos: async () => {
    const get = await adminDbController.Category.getCategoryVideo()
    if (get != null && get != undefined && Object.keys(get).length != 0) {
      return get
    } else {
       return "Caterogies not found"
    }
    },
    
    fetchCategoryBasedShop: async ({ token, query }) => {
    const categoryBasedShop = await appDbController.Profile.fetchCategoryBasedShop(token,query)
    if (categoryBasedShop != null && categoryBasedShop != undefined && Object.keys(categoryBasedShop).length != 0) {
      return categoryBasedShop
    } else {
       return "Caterogies not found"
    }
    },
    
    points: async ({token}) => {
    const fetchPoints = await appDbController.Profile.points(token)
    if (fetchPoints != null && fetchPoints != undefined && Object.keys(fetchPoints).length != 0) {
      return fetchPoints.points||0
    } else {
       return "Failed to fetch points"
    }
    },

    home: async ({ token }) => {
        let reviewAdded 
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            let fetchBanners = await appDbController.Banners.fetchBanners()
            if (fetchBanners != null && fetchBanners != undefined && (fetchBanners).length != 0) {
                fetchBanners=fetchBanners
            } else {
                fetchBanners=[]
            }
            let category = await appDbController.Profile.fetchCategory(token)
            if (category != null && category != undefined && (category).length != 0) {
                category=category
            } else {
                category=[]
            }
            const checkReview = await appDbController.Shop.checkReview(token)
            if (checkReview != null && checkReview != undefined && Object.keys(checkReview).length != 0) {
                reviewAdded=true
            } else {
                reviewAdded = false
            }
            let fetchCategoryBanners = await appDbController.Banners.fetchCategoryBanners()
            if (fetchCategoryBanners != null && fetchCategoryBanners != undefined && (fetchCategoryBanners).length != 0) {
                fetchCategoryBanners=fetchCategoryBanners
            } else {
                fetchCategoryBanners=[]
            }
            let getShops = await appDbController.Banners.getShops()
            if (getShops != null && getShops != undefined && (getShops).length != 0) {
                getShops=getShops
            } else {
                getShops=[]
            }

            // Get today's local date string in YYYY-MM-DD format
            const todayDate = new Date();
            const year = todayDate.getFullYear();
            const month = String(todayDate.getMonth() + 1).padStart(2, '0');
            const day = String(todayDate.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
            // Fetch active shop banners
            const shopBannersRaw = await appDbController.Banners.fetchActiveShopBanners();
            const todayShopBanners = [];
            if (shopBannersRaw && shopBannersRaw.length !== 0) {
                shopBannersRaw.forEach(banner => {
                    let parsedSchedule = [];
                    if (banner.bannerSchedule) {
                        try {
                            parsedSchedule = JSON.parse(banner.bannerSchedule);
                            if (typeof parsedSchedule === 'string') {
                                parsedSchedule = JSON.parse(parsedSchedule);
                            }
                        } catch (e) {
                            parsedSchedule = [];
                        }
                    }
                    if (Array.isArray(parsedSchedule)) {
                        const isToday = parsedSchedule.some(d => {
                            if (d === todayStr) return true;
                            try {
                                const d1 = new Date(d);
                                const d2 = new Date(todayStr);
                                return !isNaN(d1.getTime()) && !isNaN(d2.getTime()) &&
                                       d1.getFullYear() === d2.getFullYear() &&
                                       d1.getMonth() === d2.getMonth() &&
                                       d1.getDate() === d2.getDate();
                            } catch (e) {
                                return false;
                            }
                        });
                        if (isToday) {
                            todayShopBanners.push({
                                ...banner,
                                bannerSchedule: parsedSchedule
                            });
                        }
                    }
                });
            }

            return {
                profile: fetchUser.profilePic,
                userName: fetchUser.userName,
                topBanners: fetchBanners,
                category: category,
                reviewStatus: reviewAdded,
                categoryBanners: fetchCategoryBanners,
                shops: getShops,
                shopBanners: todayShopBanners
           } 
        } else {
            return "Profile not found";
        }
    },

    nonauthendicateHome: async () => {
            let category = await appDbController.Profile.fetchNonauthendicateCategory()
        if (category != null && category != undefined && (category).length != 0) {
                let fetchBanners = await appDbController.Banners.fetchBanners()
            if (fetchBanners != null && fetchBanners != undefined && (fetchBanners).length != 0) {
                fetchBanners=fetchBanners
            } else {
                fetchBanners=[]
            }
            let fetchCategoryBanners = await appDbController.Banners.fetchCategoryBanners()
            if (fetchCategoryBanners != null && fetchCategoryBanners != undefined && (fetchCategoryBanners).length != 0) {
                fetchCategoryBanners=fetchCategoryBanners
            } else {
                fetchCategoryBanners=[]
            }
            let getShops = await appDbController.Banners.getShops()
            if (getShops != null && getShops != undefined && (getShops).length != 0) {
                getShops=getShops
            } else {
                getShops=[]
            }
            
            // Get today's local date string in YYYY-MM-DD format
            const todayDate = new Date();
            const year = todayDate.getFullYear();
            const month = String(todayDate.getMonth() + 1).padStart(2, '0');
            const day = String(todayDate.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            // Fetch active shop banners
            const shopBannersRaw = await appDbController.Banners.fetchActiveShopBanners();
            const todayShopBanners = [];
            if (shopBannersRaw && shopBannersRaw.length !== 0) {
                shopBannersRaw.forEach(banner => {
                    let parsedSchedule = [];
                    if (banner.bannerSchedule) {
                        try {
                            parsedSchedule = JSON.parse(banner.bannerSchedule);
                            if (typeof parsedSchedule === 'string') {
                                parsedSchedule = JSON.parse(parsedSchedule);
                            }
                        } catch (e) {
                            parsedSchedule = [];
                        }
                    }
                    if (Array.isArray(parsedSchedule)) {
                        const isToday = parsedSchedule.some(d => {
                            if (d === todayStr) return true;
                            try {
                                const d1 = new Date(d);
                                const d2 = new Date(todayStr);
                                return !isNaN(d1.getTime()) && !isNaN(d2.getTime()) &&
                                       d1.getFullYear() === d2.getFullYear() &&
                                       d1.getMonth() === d2.getMonth() &&
                                       d1.getDate() === d2.getDate();
                            } catch (e) {
                                return false;
                            }
                        });
                        if (isToday) {
                            todayShopBanners.push({
                                ...banner,
                                bannerSchedule: parsedSchedule
                            });
                        }
                    }
                });
            }

            return {
                topBanners: fetchBanners,
                category: category,
                categoryBanners: fetchCategoryBanners,
                shops: getShops,
                shopBanners: todayShopBanners
                }
            } else {
                return []
            }
    },

    deleteAccount: async ({ token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const deleteAccount = await appDbController.Profile.deleteAccount(token)
            if (deleteAccount != null && deleteAccount != undefined) {
                return deleteAccount
            } else {
                throw Error.InternalError("Failed to delete the account")
            }
        } else {
            return "Profile not found";
        }
    },

    notificationPreference: async ({ token, body }) => {
        const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
        body.userId = token;
        const fetchUserPreference = await appDbController.Notifications.fetchNotificationPreference(token);
        if (fetchUserPreference != null && fetchUserPreference != undefined) {
          //update preference
          await appDbController.Notifications.updateNotificationPreference(body);
          return "Notification Preference Updated";
        } else {
          //create Preference
          await appDbController.Notifications.createNotificationPreference(body);
          return "Notification Preference Updated";
        }
    }
    else {
      return "User not found"
    }
    },

    fetchNotificationPreference: async ({ token }) => {
        const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
        // body.userId = token;
            const fetched = await appDbController.Notifications.fetchNotificationPreference(token);
        if (fetched != null && fetched != undefined) {
          return fetched;
        } else {
          const created = await appDbController.Notifications.createNotificationPreference(token);
          delete created.dataValues.id;
          delete created.dataValues.userId;
          delete created.dataValues.createdAt;
          delete created.dataValues.updatedAt;
          return created;
        }
    }
    else {
      return "User not found"
    }
    },
    
    fetchNotifications: async ({token,query}) => {
        const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {

            //All data loaded every time
            // const page = Number(query.page) || 1;
            // const pageSize = process.env.PAGINATION_PAGE_SIZE;
            // const limit = page * pageSize;
            // let data = {
            //     limit: limit,
            // }            
            
            //Particular page data load
            const page = Number(query.page) || 1;
            const pageSize = Number(process.env.PAGINATION_PAGE_SIZE) || 10;
            const offset = (page - 1) * pageSize;
            let data = {
             limit: pageSize,
             offset: offset
            };

            let notification = await appDbController.Notifications.fetchNotifications(token, data)  
            if (notification != null && notification != undefined && notification.length != 0) {
              for (let index = 0; index < notification.length; index++) {
              notification[index].createdAt = moment(notification[index].createdAt).fromNow();
              }
              let readStatus = await appDbController.Notifications.notificationsReadStatus(token);
              if(readStatus!=null&&readStatus!=undefined&&readStatus[0]!=0)
              {
                // return {
                // success: true,
                // currentPage: page,
                // totalRecords: notification.count,
                // totalPages: Math.ceil(notification.count / limit),
                // data: notification,
                   return notification

                // }
              }
              else {
                  return notification
              }
          }
          else {
            return []
          }
        }
        else {
          return "User not found"
        }
        },
    
    notificationOpenStatus: async ({ token, query }) => {
        const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
          let notifications = await appDbController.Notifications.notificationById(token,query);
          if (notifications != null && notifications != undefined && Object.keys(notifications).length != 0) {
            let readStatus = await appDbController.Notifications.notificationOpenStatus(token,query);
              if (readStatus != null && readStatus != undefined && readStatus[0] != 0) {
                  return true
              } else {
                  return false
              }
          }
          else {
            return []
          }
        }
        else {
          return "User not found"
        }
      },
        
      notificationCount: async ({ token }) => {
        const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
            const notificationCount = await appDbController.Notifications.notificationCount(token)
          if (notificationCount != null && notificationCount != undefined ) {
             return notificationCount
          }
          else {
            return 0
          }
        }
        else {
          return "User not found"
        }
      },
    
        
      addReview: async ({ token,body }) => {
        const checkUser = await appDbController.Profile.getProfile(token);
          if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
                  const checkReview = await appDbController.Shop.checkReview(token)
                  if (checkReview != null && checkReview != undefined && Object.keys(checkReview).length != 0) {
                      return "Your review already added"
                  } else {
                      const addReviews = await appDbController.Shop.addReview(token, body)
                      if (addReviews != null && addReviews != undefined && Object.keys(addReviews).length != 0) {
                          return "Review added"
                      }
                      else {
                          throw Error.InternalError("Failed to add review")
                      }
                  }     
        }
        else {
          return "User not found"
        }
      },

    privacyPolicy: async ({token}) => {
          const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
            return `/privacyPolicy`
        }
        else {
          return "User not found"
        }
    },

    terms: async ({token}) => {
        const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
            return `/terms-and-condtions`
        }
        else {
          return "User not found"
        }
    },

    mapmanAppLink: async ({token}) => {
        // const checkUser = await appDbController.Profile.getProfile(token);
        // if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
            return `/appLink`
        // }
        // else {
        //   return "User not found"
        // }
    },

    fetchBanners: async () => {
        const fetchBanners = await appDbController.Banners.fetchBanners();
        if (fetchBanners != null && fetchBanners != undefined && Object.keys(fetchBanners).length != 0) {
            return fetchBanners
        }
        else {
          return []
        }
    },

    fetchCategoryBanners: async () => {
        const fetchBanners = await appDbController.Banners.fetchCategoryBanners();
        if (fetchBanners != null && fetchBanners != undefined && Object.keys(fetchBanners).length != 0) {
            return fetchBanners
        }
        else {
          return []
        }
    },

    reportShop: async ({ token, body }) => {
        const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
             const checkShop = await appDbController.Shop.getShopById(body)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                body.personMobile=checkUser.phone
               const repotShop = await appDbController.Shop.reportShop(token,body)
                if (repotShop != null && repotShop != undefined && Object.keys(repotShop).length!= 0) {
                    return "Shop reported"
                }
                else {
                    throw Error.InternalError("Failed to report the shop")
            }} else {
              return "Shop not active now!..."
            }
        } else {
          return "User not found"
        }
    },

    reportAnIssue: async ({ token, body, image }) => {
        if (token == null || token == undefined) {
            token = 0
            body.personMobile = null
            const reportAnIssue = await appDbController.Shop.reportAnIssue(token, body,image)
            if (reportAnIssue != null && reportAnIssue != undefined && Object.keys(reportAnIssue).length != 0) {
                return "Issue reported"
            }
            else {
                throw Error.InternalError("Failed to report the issue")
            }
        } else {
            token = token
            const checkUser = await appDbController.Profile.getProfile(token);
        if (checkUser != null && checkUser != undefined && Object.keys(checkUser).length != 0) {
            body.personMobile = checkUser.phone
            const reportAnIssue = await appDbController.Shop.reportAnIssue(token, body)
            if (reportAnIssue != null && reportAnIssue != undefined && Object.keys(reportAnIssue).length != 0) {
                return "Issue reported"
            }
            else {
                throw Error.InternalError("Failed to report the issue")
            }
        }
        else {
          return "User not found"
        }
        }
        
    },
    
    versionControl: async ({ body }) => {
        const getVersion = await appDbController.Banners.getVersion(body)
        console.log("getversion ",getVersion)
        if (getVersion != null && getVersion != undefined && Object.keys(getVersion).length != 0) {
            const updateVersion = await appDbController.Banners.updateVersion(body)
            if (updateVersion != null && updateVersion != undefined && updateVersion[0] != 0) {
                return "Version updated"
            } else {
                throw Error.SomethingWentWrong("Failed to update version")
            }
        } else {
            const addVersion = await appDbController.Banners.versionControl(body)
            if (addVersion != null && addVersion != undefined && Object.keys(addVersion).length != 0) {
            return "Version added"
            } else {
            throw Error.SomethingWentWrong("Failed to add version")
            }
        }
    },
      
    getVersion: async ({ body }) => {
        const getVersion = await appDbController.Banners.getVersion(body)
        if (getVersion != null && getVersion != undefined && Object.keys(getVersion).length != 0) {
            return getVersion
        } else {
            return null
        }
    },
      
    contactUs: async ({ body }) => {
        const contactUs = await appDbController.Notifications.contactUs(body)
        if (contactUs != null && contactUs != undefined && Object.keys(contactUs).length != 0) {
            messagingFunction.sendContactUsEmail(body);
            return "Details submitted"
        } else {
            throw Error.SomethingWentWrong("Failed to submit the details")
        }
    },
      
    createBannerImage: async ({ token, body, image }) => {
        // console.log("token",token)
        // console.log("body",body)
        // console.log("image",image)
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {   
            const fetchUser = await appDbController.Shop.getMyShop(token, body);
            if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
                if (body.type == "update") {
                    const checkShop = await appDbController.Notifications.getShopBannerId(token, body)
                    if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                        const bannerUpdate = await appDbController.Notifications.updateBannerImage(token, body, image)
                        // return bannerUpdate
                        if (bannerUpdate != null && bannerUpdate != undefined ) {
                            return bannerUpdate
                        } else {
                                    throw Error.InternalError("Failed to update banner image")
                        }
                        
                    } else {
                        return Error.SomethingWentWrong("Banner not found")
                    }
                } else if (body.type == "add") {
                    // else {
                    const fetchBanners = await appDbController.Notifications.fetchShopBanner(token,body)
                    //Get all the token banners
                    if (fetchBanners != null && fetchBanners != undefined && fetchBanners.length != 0) {
                        if (fetchBanners.length <= 1) {
                            const addBanner = await appDbController.Notifications.createBannerImage(token, body, image)
                            if (addBanner != null && addBanner != undefined && Object.keys(addBanner).length != 0) {
                                return "Banner added ";
                            } else {
                                throw Error.InternalError("Failed to add the banner")
                            }
                        } else {
                            throw Error.SomethingWentWrong("You already added 2 banners!..")
                        }
                    }
                    //If token shops not found add the shop
                    else {
                        const addBanner = await appDbController.Notifications.createBannerImage(token, body, image)
                            if (addBanner != null && addBanner != undefined && Object.keys(addBanner).length != 0) {
                                return "Banner added";
                            } else {
                                throw Error.InternalError("Failed to add the banner")
                            }
                    }
                } else {
                    throw Error.SomethingWentWrong("Select update/add banner")
                }
            } else {
                return "Shop not found"
            }
        } else {
            return "Profile not found";
        }
    },
      
    createBannerText: async ({ token,body }) => {
         const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {   
            const fetchUser = await appDbController.Shop.getMyShop(token, body);
            if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
                if (body.type == "update") {
                    console.log("update")
                    const checkBanner = await appDbController.Notifications.getShopBannerId(token, body)
                    if (checkBanner != null && checkBanner != undefined && Object.keys(checkBanner).length != 0) {
                        // if (image != null) {
                        //     image=image
                        // } else {
                        //     image=checkBanner.illustration
                        // }
                        const bannerUpdate = await appDbController.Notifications.updateBannerText(token,body)
                        // return bannerUpdate
                        if (bannerUpdate != null && bannerUpdate != undefined ) {
                            return bannerUpdate
                        } else {
                                    throw Error.InternalError("Failed to update banner")
                        }
                        
                    } else {
                        return Error.SomethingWentWrong("Banner not found")
                    }
                } else if (body.type == "add") {
                    // else {
                    const fetchBanners = await appDbController.Notifications.fetchShopBanner(token,body)
                    //Get all the token banners
                    if (fetchBanners != null && fetchBanners != undefined && fetchBanners.length != 0) {
                        if (fetchBanners.length <= 1) {
                            const addBanner = await appDbController.Notifications.createBannerText(token,body)
                            if (addBanner != null && addBanner != undefined && Object.keys(addBanner).length != 0) {
                                return "Banner added ";
                            } else {
                                throw Error.InternalError("Failed to add the banner")
                            }
                        } else {
                            throw Error.SomethingWentWrong("You already added 2 banners!..")
                        }
                    }
                    //If token shops not found add the shop
                    else {
                        const addBanner = await appDbController.Notifications.createBannerText(token,body)
                            if (addBanner != null && addBanner != undefined && Object.keys(addBanner).length != 0) {
                                return "Banner added";
                            } else {
                                throw Error.InternalError("Failed to add the banner")
                            }
                    }
                } else {
                    throw Error.SomethingWentWrong("Select update/add banner")
                }
            } else {
                return "Shop not found"
            }
        } else {
            return "Profile not found";
        }
    },
      
    deleteBanner: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkBanner = await appDbController.Banners.checkShopBannerById(token, body)
            if(checkBanner!=null&&checkBanner!=undefined)
            {
            const deleteBanner = await appDbController.Notifications.deleteBanner(token, body)
                if (deleteBanner != null && deleteBanner != undefined && Object.keys(deleteBanner).length != 0) {
                return deleteBanner
                } else {
                throw Error.SomethingWentWrong("Failed to delete the banner ")
                }
            } else {
                return "Shop banner not found"
            }
            } else {
            return "Profile not found";
        }
    },      
      
    fetchShopBanner: async ({ token,query }) => {
        const fetchShopBanner = await appDbController.Notifications.fetchShopBanner(token,query)
        if (fetchShopBanner != null && fetchShopBanner != undefined && Object.keys(fetchShopBanner).length != 0) {
            const parsedBanners = fetchShopBanner.map(banner => {
                let parsedSchedule = [];
                try {
                    parsedSchedule = JSON.parse(banner.bannerSchedule || "[]");
                    if (typeof parsedSchedule === 'string') {
                        parsedSchedule = JSON.parse(parsedSchedule);
                    }
                    if (!Array.isArray(parsedSchedule)) {
                        parsedSchedule = [];
                    }
                } catch (e) {
                    parsedSchedule = [];
                }
                return {
                    ...banner,
                    bannerSchedule: parsedSchedule
                }
            });
            return parsedBanners;
        } else {
            return []
        }
    },
      
    manageOffers: async ({ token,body }) => {
        // console.log("token",token)
        // console.log("body",body)
        // console.log("image",image)
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {   
            const fetchUser = await appDbController.Shop.getMyShop(token, body);
            if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
                if (body.type == "update") {
                    const checkShop = await appDbController.Notifications.getShopOfferId(token, body)
                    if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                        const updateOffer = await appDbController.Notifications.updateOffers(token, body)
                        if (updateOffer != null && updateOffer != undefined ) {
                            return updateOffer
                        } else {
                            throw Error.InternalError("Failed to update offer")
                        }
                        
                    } else {
                        return Error.SomethingWentWrong("Offer not found")
                    }
                } else if (body.type == "add") {
                    if (!body.offerCouponCode && !body.offerCoupon) {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                        let randomCode = "";
                        for (let i = 0; i < 6; i++) {
                            randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        const generatedCode = "OFFER" + randomCode;
                        body.offerCouponCode = generatedCode;
                        body.offerCoupon = generatedCode;
                    } else if (body.offerCouponCode && !body.offerCoupon) {
                        body.offerCoupon = body.offerCouponCode;
                    } else if (body.offerCoupon && !body.offerCouponCode) {
                        body.offerCouponCode = body.offerCoupon;
                    }
                    const fetchOffers = await appDbController.Notifications.fetchShopOffers(token,body)
                    //Get all the token banners
                    if (fetchOffers != null && fetchOffers != undefined && fetchOffers.length != 0) {
                        if (fetchOffers.length <= 1) {
                            const addBanner = await appDbController.Notifications.createOffers(token, body)
                            if (addBanner != null && addBanner != undefined && Object.keys(addBanner).length != 0) {
                                return "Offer added ";
                            } else {
                                throw Error.InternalError("Failed to add the offer")
                            }
                        } else {
                            throw Error.SomethingWentWrong("You already added 2 offers!..")
                        }
                    }
                    //If token shops not found add the shop
                    else {
                        const addBanner = await appDbController.Notifications.createOffers(token, body)
                            if (addBanner != null && addBanner != undefined && Object.keys(addBanner).length != 0) {
                                return "Offer added";
                            } else {
                                throw Error.InternalError("Failed to add the offer")
                            }
                    }
                } else {
                    throw Error.SomethingWentWrong("Select update/add offer")
                }
            } else {
                return "Shop not found"
            }
        } else {
            return "Profile not found";
        }
    },
            
    fetchShopOffers: async ({ token, query }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
        const checkShop = await appDbController.Shop.getMyShop(token,query)
        if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
            const fetchShopOffers = await appDbController.Notifications.fetchShopOffers(token, query)
            console.log("fetch ",fetchShopOffers)
        if (fetchShopOffers != null && fetchShopOffers != undefined && Object.keys(fetchShopOffers).length != 0) {
            const appliedHistory = await appDbController.Coupons.getOfferCouponHistory(token);
            const appliedCodes = new Set(
                (appliedHistory || [])
                    .map(h => (h.offerCouponCode || h.couponCode || "").trim().toUpperCase())
                    .filter(Boolean)
            );
            const appliedOfferIds = new Set(
                (appliedHistory || [])
                    .filter(h => h.offerId)
                    .map(h => String(h.offerId))
            );

            const parsedData = fetchShopOffers.map(offer => {
                const couponCodeVal = offer.offerCouponCode || offer.offerCoupon;
                const isApplied = Boolean(
                    (couponCodeVal && appliedCodes.has(couponCodeVal.trim().toUpperCase())) ||
                    (offer.id && appliedOfferIds.has(String(offer.id)))
                );
                return {
                    ...offer,
                    offerDetails: offer.offerDetails ? JSON.parse(offer.offerDetails) : [],
                    termsAndConditions: offer.termsAndConditions ? JSON.parse(offer.termsAndConditions) : [],
                    offerCouponApplied: isApplied
                };
            });
            return parsedData
        } else {
            return []
                }
        } else {
            return "Shop not found"
        }
        } else {
            return "Profile not found";
        }
    },

     deleteOffers: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
         if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
             const checkOffer = await appDbController.Notifications.checkOffer(token, body)
             if (checkOffer != null && checkOffer != undefined) {
                 const deleteOffers = await appDbController.Notifications.deleteOffers(token, body)
                 if (deleteOffers != null && deleteOffers != undefined && Object.keys(deleteOffers).length != 0) {
                     return deleteOffers
                 } else {
                     throw Error.SomethingWentWrong("Failed to delete the offer")
                 }
             } else {
                 return "Offer not found"
             }   
        } else {
            return "Profile not found";
        }
    },   
      
    fetchColors: async ({token}) => {
         const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {

        const get = await appDbController.Settings.fetchColors()
        if (get != null && get != undefined && Object.keys(get).length != 0) {
            return get
        } else {
            return []
            }
            } else {
            return "Profile not found";
        }
            
    },

        fetchIllustration: async ({token}) => {
         const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {

        const get = await appDbController.Settings.fetchIllustrations()
        if (get != null && get != undefined && Object.keys(get).length != 0) {
            return get
        } else {
            return []
            }
            } else {
            return "Profile not found";
        }
    },

    fetchBackgroundImage: async ({token}) => {
         const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {

        const get = await appDbController.Settings.fetchBackgroundImage()
        if (get != null && get != undefined && Object.keys(get).length != 0) {
            return get
        } else {
            return []
            }
            } else {
            return "Profile not found";
        }
    },


    fetchAllOffers: async ({token}) => {
         const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
        const get = await appDbController.Notifications.fetchAllOffers(token)
        if (get != null && get != undefined && Object.keys(get).length != 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const activeOffers = get.filter(offer => {
                if (!offer.offerExpiry) {
                    return true;
                }
                try {
                    const daysMatch = String(offer.offerExpiry).trim().match(/^(\d+)\s*(day|days|d)?$/i);
                    if (daysMatch) {
                        const expiryDays = parseInt(daysMatch[1]);
                        const createdAtDate = new Date(offer.createdAt);
                        const expiryDate = new Date(createdAtDate);
                        expiryDate.setDate(expiryDate.getDate() + expiryDays);
                        expiryDate.setHours(0, 0, 0, 0);
                        
                        const isKeep = expiryDate >= today;
                        console.log(`[Offer Filter] ID: ${offer.id}, Expiry: ${offer.offerExpiry}, CreatedAt: ${offer.createdAt}, ExpiryDate: ${expiryDate.toISOString()}, Today: ${today.toISOString()}, Keep: ${isKeep}`);
                        return isKeep;
                    }
                    const expiryDate = new Date(offer.offerExpiry);
                    if (!isNaN(expiryDate.getTime())) {
                        expiryDate.setHours(0, 0, 0, 0);
                        
                        const isKeep = expiryDate >= today;
                        console.log(`[Offer Filter] ID: ${offer.id}, Expiry Date: ${offer.offerExpiry}, ExpiryDate: ${expiryDate.toISOString()}, Today: ${today.toISOString()}, Keep: ${isKeep}`);
                        return isKeep;
                    }
                    return true;
                } catch (e) {
                    // console.error("[Offer Filter] Error filtering offer ID:", offer.id, e);
                    return true;
                }
            });

            const appliedHistory = await appDbController.Coupons.getOfferCouponHistory(token);
            const appliedCodes = new Set(
                (appliedHistory || [])
                    .map(h => (h.offerCouponCode || h.couponCode || "").trim().toUpperCase())
                    .filter(Boolean)
            );
            const appliedOfferIds = new Set(
                (appliedHistory || [])
                    .filter(h => h.offerId)
                    .map(h => String(h.offerId))
            );

            const updatedOffers = activeOffers.map(offer => {
                let openStatusList = [];
                try {
                    openStatusList = JSON.parse(offer.openStatus || "[]");
                    if (!Array.isArray(openStatusList)) {
                        openStatusList = [];
                    }
                } catch (e) {
                    openStatusList = [];
                }

                // Check if current user's profile ID (token) has opened this offer
                const isOpened = openStatusList.includes(token) || 
                                 openStatusList.includes(Number(token)) || 
                                 openStatusList.includes(String(token));

                const couponCodeVal = offer.offerCouponCode || offer.offerCoupon;
                const isApplied = Boolean(
                    (couponCodeVal && appliedCodes.has(couponCodeVal.trim().toUpperCase())) ||
                    (offer.id && appliedOfferIds.has(String(offer.id)))
                );

                return {
                    ...offer,
                    offerDetails: offer.offerDetails ? JSON.parse(offer.offerDetails) : [],
                    termsAndConditions: offer.termsAndConditions ? JSON.parse(offer.termsAndConditions) : [],
                    isOpened: isOpened,
                    offerCouponApplied: isApplied
                };
            });
            return updatedOffers;
        } else {
            return []
        }
        } else {
            return "Profile not found";
        }
    },

    
    offerStatusOpen: async ({token,query}) => {
         const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
        const get = await appDbController.Notifications.getOfferId(token,query)
        if (get != null && get != undefined && Object.keys(get).length != 0) {
            let openStatusList = [];
            try {
                openStatusList = JSON.parse(get.openStatus || "[]");
                if (!Array.isArray(openStatusList)) {
                    openStatusList = [];
                }
            } catch (e) {
                openStatusList = [];
            }
            
            const profileId = Number(token);
            if (!openStatusList.includes(profileId)) {
                openStatusList.push(profileId);
            }
            
            const update = await appDbController.Notifications.offerOpenStatus(token, {
                offerId: query.offerId,
                openStatus: JSON.stringify(openStatusList)
            })
            if (update != null && update != undefined ) {
                return update
            }
            else {
                throw Error.SomethingWentWrong("Failed to open")
            }
        } else {
            return "Offer not found"
        }
        } else {
            return "Profile not found";
        }
    },

    fetchSchedule: async ({ token, query }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const getBanners = await appDbController.Notifications.fetchSchedule(token, query)
            if (getBanners != null && getBanners != undefined && getBanners.length != 0) {
                let allDates = [];
                getBanners.forEach(banner => {
                    if (banner.bannerSchedule) {
                        try {
                            let dates = JSON.parse(banner.bannerSchedule);
                            if (typeof dates === 'string') {
                                dates = JSON.parse(dates);
                            }
                            if (Array.isArray(dates)) {
                                allDates.push(...dates);
                            }
                        } catch (e) {
                            // Ignore invalid JSON
                        }
                    }
                });

                // Count occurrences of each date string
                const dateCounts = {};
                allDates.forEach(dateStr => {
                    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
                });

                // Filter to only include dates scheduled exactly 6 times across all banners
                let uniqueDates = Object.keys(dateCounts).filter(dateStr => dateCounts[dateStr] === 6);
                uniqueDates.sort();

                // If query.month is provided, filter by month (expected: YYYY-MM)
                if (query.month) {
                    uniqueDates = uniqueDates.filter(dateStr => {
                        try {
                            const d = new Date(dateStr);
                            if (/^\d{4}-\d{2}$/.test(query.month)) {
                                const [year, month] = query.month.split('-');
                                return d.getFullYear() === parseInt(year) && (d
                                    .getMonth() + 1) === parseInt(month);
                            }
                            const target = new Date(query.month);
                            if (!isNaN(target.getTime())) {
                                return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
                            }
                            return dateStr.includes(query.month);
                        } catch (e) {
                            return false;
                        }
                    });
                }

                return uniqueDates;
            } else {
                return [];
            }
        } else {
            return "Profile not found";
        }
    },

    fetchDayBanners: async ({ token, query }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            if (!query.date) {
                throw Error.SomethingWentWrong("Date parameter is required (YYYY-MM-DD)");
            }
            const getBanners = await appDbController.Notifications.fetchSchedule(token, query)
            if (getBanners != null && getBanners != undefined && getBanners.length != 0) {
                const targetDate = query.date;
                const matchedBanners = [];
                
                getBanners.forEach(banner => {
                    let parsedSchedule = [];
                    if (banner.bannerSchedule) {
                        try {
                            parsedSchedule = JSON.parse(banner.bannerSchedule);
                            if (typeof parsedSchedule === 'string') {
                                parsedSchedule = JSON.parse(parsedSchedule);
                            }
                        } catch (e) {
                            parsedSchedule = [];
                        }
                    }
                    
                    if (Array.isArray(parsedSchedule)) {
                        const isScheduledToday = parsedSchedule.some(d => {
                            if (d === targetDate) return true;
                            try {
                                const dateObj1 = new Date(d);
                                const dateObj2 = new Date(targetDate);
                                return !isNaN(dateObj1.getTime()) && !isNaN(dateObj2.getTime()) &&
                                       dateObj1.getFullYear() === dateObj2.getFullYear() &&
                                       dateObj1.getMonth() === dateObj2.getMonth() &&
                                       dateObj1.getDate() === dateObj2.getDate();
                            } catch (err) {
                                return false;
                            }
                        });
                        
                        if (isScheduledToday) {
                            matchedBanners.push({
                                ...banner,
                                bannerSchedule: parsedSchedule
                            });
                        }
                    }
                });
                
                return {
                    count: matchedBanners.length,
                    banners: matchedBanners
                };
            } else {
                return {
                    count: 0,
                    banners: []
                };
            }
        } else {
            return "Profile not found";
        }
    },

    listAssignedCoupons: async ({token}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const listCoupons = await appDbController.Coupons.listAssignedCoupons(token)
            if (listCoupons != null && listCoupons != undefined && listCoupons.length != 0) {
                return listCoupons
            } else {
                return []
            }
        } else {
            return "Profile not found";
        }
    },

    applyCoupons: async ({token,body}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkCoupon = await appDbController.Coupons.checkCoupon(body)
            if (checkCoupon != null && checkCoupon != undefined && Object.keys(checkCoupon).length != 0) {
                const checkCouponAssigned = await appDbController.Coupons.checkCouponAssigned(token, body) 
                if (checkCouponAssigned != null && checkCouponAssigned != undefined && Object.keys(checkCouponAssigned).length != 0) {
                    const couponScratched = await appDbController.Coupons.couponScratched(token, body)
                    if (couponScratched != null && couponScratched != undefined && Object.keys(couponScratched).length != 0) {
                        const couponApplied = await appDbController.Coupons.couponApplied(token, body)
                        if (couponApplied != null && couponApplied != undefined && Object.keys(couponApplied).length != 0) {
                            return "This coupon already applied"
                        } else {
                            body.couponAmount = checkCoupon.couponAmount
                            body.walletAmount = Number(fetchUser.wallet) + Number(body.couponAmount)
                            const applyCoupon = await appDbController.Coupons.applyCoupons(token, body)
                            if (applyCoupon != null && applyCoupon != undefined) {
                                return "Coupon applied"
                            } else {
                                throw Error.SomethingWentWrong("Failed to apply the coupon")
                            }
                        }
                    } else {
                        return "Coupon not scratched"
                    }
                } else {
                    return "This coupon not for this profile"
                }
            } else {
                return "Coupon not found"
            }
        } else {
            return "Profile not found";
        }
    },

    walletBalance: async ({token}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            return { wallet: fetchUser.wallet }
        } else {
            return { wallet: 0 }
        }
    },

    scratchCoupon: async ({token,body}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
         const checkCoupon = await appDbController.Coupons.checkCoupon(body)
            if (checkCoupon != null && checkCoupon != undefined && Object.keys(checkCoupon).length != 0) {
                const checkCouponAssigned = await appDbController.Coupons.checkCouponAssigned(token, body) 
                if (checkCouponAssigned != null && checkCouponAssigned != undefined && Object.keys(checkCouponAssigned).length != 0) {
                    const couponScratched = await appDbController.Coupons.couponScratched(token, body)
                    if (couponScratched != null && couponScratched != undefined && Object.keys(couponScratched).length != 0) {
                        return "Coupon already scratched"
                    } else {
                        body.couponAmount = checkCoupon.couponAmount
                        const scratchCoupon = await appDbController.Coupons.scratchCoupon(token, body)
                        if (scratchCoupon != null && scratchCoupon != undefined) {
                            return "Coupon scratched"
                        } else {
                            throw Error.SomethingWentWrong("Failed to scratch the coupon")
                        }
                    }
                } else {
                    return "This coupon not for this profile"
                }
            } else {
                return "Coupon not found"
            }
            } else {
            return "Profile not found";
        }
    },

    payNow: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (!fetchUser || Object.keys(fetchUser).length === 0) {
            return "Profile not found";
        }

        const amount = Number(body.amount);
        if (!amount || amount <= 0) {
            return "Invalid amount";
        }

        if (Number(fetchUser.wallet) < amount) {
            return "Insufficient wallet balance";
        }

        // Helper to mask account number (e.g. 123456789012 -> XXXXXXXX9012)
        const maskAccountNumber = (accNo) => {
            if (!accNo) return null;
            const str = String(accNo).trim();
            if (str.length <= 4) return str;
            return "X".repeat(str.length - 4) + str.slice(-4);
        };

        const maskedAccNumber = maskAccountNumber(body.accountNumber);

        // Execute Payout via Razorpay (or simulation in test mode)
        let razorpayResult;
        try {
            razorpayResult = await executeRazorpayPayout({
                amount,
                accountHolderName: body.accountHolderName,
                accountNumber: body.accountNumber,
                ifscCode: body.ifscCode,
                upiId: body.upiId,
                mode: body.payoutMode,
                referenceId: `payout_user_${token}_${Date.now()}`,
                contactName: body.accountHolderName || fetchUser.userName || "Shop Owner",
                contactEmail: body.email || fetchUser.email || "support@mapman.com",
                contactPhone: body.phone || fetchUser.phone || "9876543210"
            });
        } catch (gatewayErr) {
            await appDbController.Payout.logFailedPayout(token, amount, fetchUser.wallet, gatewayErr.message, body.couponId, {
                shopId: body.shopId || null,
                accountHolderName: body.accountHolderName || null,
                accountNumber: maskedAccNumber,
                ifscCode: body.ifscCode ? String(body.ifscCode).toUpperCase().trim() : null,
                upiId: body.upiId ? String(body.upiId).trim() : null,
                mode: body.payoutMode || (body.upiId ? "UPI" : "IMPS")
            });
            throw Error.SomethingWentWrong(gatewayErr.message);
        }

        const payoutDetails = {
            payoutId: razorpayResult.payoutId,
            status: razorpayResult.status || "processed",
            mode: razorpayResult.mode || body.payoutMode || (body.upiId ? "UPI" : "IMPS"),
            shopId: body.shopId || null,
            accountHolderName: body.accountHolderName || null,
            accountNumber: maskedAccNumber,
            ifscCode: body.ifscCode ? String(body.ifscCode).toUpperCase().trim() : null,
            upiId: body.upiId ? String(body.upiId).trim() : null
        };

        try {
            const { newBalance } = await appDbController.Payout.processDebitAndLog(
                token,
                amount,
                payoutDetails,
                fetchUser.wallet,
                body.couponId
            );

            return razorpayResult.isMock
                ? "Amount successfully debited and payout processed in test mode"
                : "Amount successfully debited and payout initiated via Razorpay";
        } catch (error) {
            await appDbController.Payout.logFailedPayout(token, amount, fetchUser.wallet, error.message, body.couponId, payoutDetails);
            throw Error.SomethingWentWrong("Payout failed: " + error.message);
        }
    },

    transactionHistory: async ({ token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (!fetchUser || Object.keys(fetchUser).length === 0) {
            return "Profile not found";
        }

        const history = await appDbController.Payout.getTransactionHistory(token);
        if (history != null && history != undefined && history.length > 0) {
            for (let index = 0; index < history.length; index++) {
                history[index].createdAt = moment(history[index].createdAt).fromNow();
            }
            return history;
        } else {
            return [];
        }
    },

    addUpi: async ({ token, body }) => {
        const profileId = token || body?.profileId;
        if (!profileId) {
            throw Error.NotValid("Profile", "Profile ID is required");
        }
        const upi = body?.upi || body?.upiId;
        if (!upi || typeof upi !== 'string' || upi.trim() === '') {
            throw Error.NotValid("UPI", "UPI ID is required");
        }
        const fetchUser = await appDbController.Profile.getProfile(profileId);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const updateUpi = await appDbController.Profile.addUpi(profileId, upi.trim());
            if (updateUpi != null && updateUpi != undefined && updateUpi[0] != 0) {
                return "UPI added successfully";
            } else {
                throw Error.InternalError("Failed to add UPI");
            }
        } else {
            return "Profile not found";
        }
    },

    fetchUpi: async ({ token, query }) => {
        const profileId = token || query?.profileId;
        if (!profileId) {
            throw Error.NotValid("Profile", "Profile ID is required");
        }
        const fetchUser = await appDbController.Profile.getProfile(profileId);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            return {
                upi: fetchUser.upi || null
            };
        } else {
            return "Profile not found";
        }
    },

    applyOfferCoupon: async ({ token, body, query }) => {
        const profileId = token || body?.profileId || query?.profileId;
        if (!profileId) {
            throw Error.NotValid("Profile", "Profile is required");
        }
        const fetchUser = await appDbController.Profile.getProfile(profileId);
        if (!fetchUser || Object.keys(fetchUser).length === 0) {
            return "Profile not found";
        }

        const rawAmount = body?.amount !== undefined ? body.amount : (body?.totalAmount !== undefined ? body.totalAmount : query?.amount);
        if (rawAmount === undefined || rawAmount === null || isNaN(Number(rawAmount))) {
            throw Error.NotValid("Amount", "Valid amount is required");
        }
        const amount = Number(rawAmount);
        const applyType = (body?.applyType || query?.applyType || "").toString().trim();
        const couponCode = (
            body?.offerCouponCode || 
            body?.couponCode || 
            body?.offerCoupon || 
            body?.coupon || 
            body?.offer_coupon_code ||
            body?.coupon_code ||
            body?.code ||
            query?.offerCouponCode ||
            query?.couponCode ||
            ""
        ).toString().trim();

        if (applyType.toLowerCase() === "apply") {
            if (!couponCode) {
                throw Error.NotValid("Coupon", "Coupon code is required");
            }

            // 1. Fetch the offer by coupon code
            const coupon = await appDbController.Coupons.findOfferCoupon(couponCode);
            if (!coupon) {
                throw Error.NotFound("Coupon", "Invalid coupon code");
            }

            // 2. Check if the offer has expired or not
            const isOfferExpired = (createdAt, offerExpiry) => {
                if (!offerExpiry || ["none", "unlimited", "never"].includes(String(offerExpiry).trim().toLowerCase())) {
                    return false;
                }

                const created = new Date(createdAt);
                const todayMidnight = new Date();
                todayMidnight.setHours(0, 0, 0, 0);

                const expiryStr = String(offerExpiry).trim().toLowerCase();

                // Hours: "12 hours", "24 hrs", "6h"
                const hoursMatch = expiryStr.match(/^(\d+)\s*(hour|hours|hr|hrs|h)$/);
                if (hoursMatch) {
                    const hours = parseInt(hoursMatch[1]);
                    const expiryTime = created.getTime() + (hours * 60 * 60 * 1000);
                    return Date.now() > expiryTime;
                }

                // Days: "1 day", "3 days", "7d", "15"
                const daysMatch = expiryStr.match(/^(\d+)\s*(day|days|d)?$/);
                if (daysMatch) {
                    const days = parseInt(daysMatch[1]);
                    const expiryDate = new Date(created);
                    expiryDate.setDate(expiryDate.getDate() + days);
                    expiryDate.setHours(0, 0, 0, 0);
                    return todayMidnight > expiryDate;
                }

                // Weeks: "1 week", "2 weeks", "3w"
                const weeksMatch = expiryStr.match(/^(\d+)\s*(week|weeks|w)$/);
                if (weeksMatch) {
                    const weeks = parseInt(weeksMatch[1]);
                    const expiryDate = new Date(created);
                    expiryDate.setDate(expiryDate.getDate() + (weeks * 7));
                    expiryDate.setHours(0, 0, 0, 0);
                    return todayMidnight > expiryDate;
                }

                // Months: "1 month", "2 months", "3m"
                const monthsMatch = expiryStr.match(/^(\d+)\s*(month|months|m)$/);
                if (monthsMatch) {
                    const months = parseInt(monthsMatch[1]);
                    const expiryDate = new Date(created);
                    expiryDate.setMonth(expiryDate.getMonth() + months);
                    expiryDate.setHours(0, 0, 0, 0);
                    return todayMidnight > expiryDate;
                }

                // DD/MM/YYYY or DD-MM-YYYY
                const dmyMatch = expiryStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (dmyMatch) {
                    const day = parseInt(dmyMatch[1]);
                    const month = parseInt(dmyMatch[2]) - 1;
                    const year = parseInt(dmyMatch[3]);
                    const expiryDate = new Date(year, month, day);
                    expiryDate.setHours(0, 0, 0, 0);
                    return todayMidnight > expiryDate;
                }

                // Absolute Date (e.g. "2026-12-31")
                const parsedDate = new Date(offerExpiry);
                if (!isNaN(parsedDate.getTime())) {
                    parsedDate.setHours(0, 0, 0, 0);
                    return todayMidnight > parsedDate;
                }

                return false;
            };

            const expired = isOfferExpired(coupon.createdAt, coupon.offerExpiry);
            if (expired) {
                throw Error.NotValid("Offer", "This offer has expired");
            }

            // 3. Check if that offer's shop is available or not
            if (!coupon.shopId) {
                throw Error.NotFound("Shop", "Offer shop not found");
            }
            const checkShop = await appDbController.Shop.getShopById({ shopId: coupon.shopId });
            if (!checkShop || Object.keys(checkShop).length === 0 || checkShop.status !== "active") {
                throw Error.NotFound("Shop", "Offer shop is not available");
            }

            // 4. Check if user has already applied this offer coupon code once
            const alreadyApplied = await appDbController.Coupons.checkOfferCouponApplied(profileId, couponCode);
            if (alreadyApplied) {
                throw Error.AlreadyExists("Coupon", "This offer coupon has already been applied and cannot be used again");
            }

            // 5. Calculate discount from myOffers
            let couponDiscountPercentage = 0;
            let couponDiscountAmount = 0;

            if (coupon.offerPercentage) {
                couponDiscountPercentage = parseFloat(String(coupon.offerPercentage).replace("%", "")) || 0;
                couponDiscountAmount = Math.round((amount * couponDiscountPercentage) / 100);
            } else if (coupon.couponAmount) {
                couponDiscountAmount = Number(coupon.couponAmount) || 0;
                couponDiscountPercentage = amount > 0 ? Math.round((couponDiscountAmount / amount) * 100) : 0;
            }

            couponDiscountAmount = Math.min(couponDiscountAmount, amount);
            const totalPay = Math.max(0, amount - couponDiscountAmount);
            const cashbackEarn = Math.round(totalPay * 0.05);


            return {
                amount: amount,
                couponDiscountPercentage: couponDiscountPercentage,
                couponDiscountAmount: couponDiscountAmount,
                totalPay: totalPay,
                cashbackEarn: cashbackEarn,
                applyType: "apply"
            };
        } else if (applyType.toLowerCase() === "notapply") {
            return {
                amount: amount,
                couponDiscountPercentage: 0,
                couponDiscountAmount: 0,
                totalPay: amount,
                cashbackEarn: 0,
                applyType: "notApply"
            };
        } else {
            return "Please mention coupon applied or not (apply or notApply)";
        }
    },

    upiPay: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const offerCoupon = await appDbController.Coupons.logOfferCouponApplied(token,body)
            if (offerCoupon != null && offerCoupon != undefined) {
                return "Payment history added successfully"
            } else {
                return "Failed to add payment history"
            }
        } else {
            return "Profile not found";
        }
    },

    offerCouponHistory: async ({ token, query }) => {
        const profileId = token || query?.profileId;
        if (!profileId) {
            throw Error.NotValid("Profile", "Profile is required");
        }
        const fetchUser = await appDbController.Profile.getProfile(profileId);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const history = await appDbController.Coupons.getOfferCouponHistory(profileId);
            if (history && history.length > 0) {
                for (let i = 0; i < history.length; i++) {
                    history[i].createdAt = moment(history[i].createdAt).fromNow();
                }
                return history;
            }
            return [];
        } else {
            return "Profile not found";
        }
    }
};







