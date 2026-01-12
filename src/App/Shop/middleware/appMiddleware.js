import require from "requirejs";
var CryptoJS = require("crypto-js");
import * as Error from "../../../Core/errors/ErrorConstant.js";
import { authentications } from "../../../Core/utils/jwt.js";
import { appDbController } from "../../../Core/database/Controller/appDbController.js";
import moment from "moment";
import capitalize from "lodash/capitalize.js";
import { FirebaseService } from "../../../Core/utils/notifier.js";
import { category } from "../../../Core/database/models/shopModel.js";
const excelToJson = require('convert-excel-to-json');
import { adminDbController } from "../../../Core/database/Controller/adminDbController.js";
export class appMiddleware { }


appMiddleware.App = {

    addNewCategory: async ({ token, body }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const addCategory = await appDbController.Profile.addCategory(token, body)
            if (addCategory != null && addCategory != undefined && Object.keys(addCategory).length != 0) {
                return "Your category added successfully"
            } else {
                throw Error.InternalError("Failed to add category")
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
  
    shopRegister: async ({ body, token, images }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getShop(token)
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
                const registerShop = await appDbController.Shop.registerShop(token,body,images)
                if (registerShop != null && registerShop != undefined && Object.keys(registerShop).length != 0) {
                    const fetchPreferenceWithIds = await appDbController.Notifications.fetchNotificationPreferencesForShopUsers(token)
                    if (fetchPreferenceWithIds.preferenceMatchedUsers != null && fetchPreferenceWithIds.preferenceMatchedUsers != undefined && fetchPreferenceWithIds.preferenceMatchedUsers.length != 0) {
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
                        var notify = {
                            userId: fetchPreferenceWithIds.ids,
                            token: uniqueTokens,
                            msgTitle: body.shopName,
                            msgImage:images.shopImage,
                            msgDesc: "New shop will be added",
                            msgType: "newShop",
                            msgStatus: "accepted",
                            msgLink: registerShop.id,
                            // msgLink: '/notifications',
                        };                       
                        if (uniqueTokens != null && uniqueTokens != undefined && uniqueTokens.length != 0) {
                            const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                            
                            if (checkExists == true) {
                              await FirebaseService.sendNotifications(notify);
                              return "Shop registered successfully"
                            }
                            else {
                                return "Shop registered successfully"
                            }
                          }
                          else { 
                            const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                            return "Shop registered successfully"
                          }
                    } else {
                        // const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                        // if (checkExists == true) {
                        //   await FirebaseService.sendNotifications(notify);
                        //   return "Shop registered successfully"
                        // }
                        // else {
                        //     return "Shop registered successfully"
                        // }
                        return "Shop registered successfully"
                    }
                } else {
                    throw Error.InternalError("Failed to register the shop")
                }             
            }          
        } else {
            return "Profile not found";
        }
    },
    
    deleteShop: async ({token,query}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getShop(token)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
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
            const checkShop = await appDbController.Shop.getShop(token)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                return checkShop
            } else {
                return null
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

    saveShop: async ({ token,body}) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShopById = await appDbController.Shop.getShopById(body)
            if (checkShopById != null && checkShopById != undefined && Object.keys(checkShopById).length != 0) {
                const checkShop = await appDbController.Shop.checkShop(token,body)
                if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                const saveShop = await appDbController.Shop.updateSaveShop(token,body)
                if (saveShop != null && saveShop != undefined && saveShop.length != 0) {
                    return saveShop
                }
                else {
                    throw Error.InternalError("Failed to update the shop")
                    }
                }
                else {
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
             const page = Number(query.page) || 1;
            const pageSize = process.env.PAGINATION_PAGE_SIZE;
            const limit = page * pageSize;
            let data = {
                limit: limit,
            }
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

    videoRegister: async ({ body, token, video }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const checkShop = await appDbController.Shop.getShop(token)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                const videoUpload=await appDbController.Shop.videoUpload(body,token,video)
                // if (videoUpload != null && videoUpload != undefined && Object.keys(videoUpload).length != 0) {
                //     // return "Video uploaded"
                // }
                if (videoUpload != null && videoUpload != undefined && Object.keys(videoUpload).length != 0) {
                    const fetchPreferenceWithIds = await appDbController.Notifications.fetchNotificationPreferencesForVideoUsers(token)
                    if (fetchPreferenceWithIds.preferenceMatchedUsers != null && fetchPreferenceWithIds.preferenceMatchedUsers != undefined && fetchPreferenceWithIds.preferenceMatchedUsers.length != 0) {
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
                        var notify = {
                            userId: fetchPreferenceWithIds.ids,
                            token: uniqueTokens,
                            msgTitle: body.videoTitle,
                            msgImage:video,
                            msgDesc: "New video will be added",
                            msgType: "newVideo",
                            msgStatus: "accepted",
                            msgLink:videoUpload.id,
                            // msgLink: '/notifications',
                          };                       
                          if (uniqueTokens != null && uniqueTokens != undefined && uniqueTokens.length != 0) {
                            const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                            if (checkExists == true) {
                              await FirebaseService.sendNotifications(notify);
                              return "Video uploaded"
                            }
                            else {
                                return "Video uploaded"
                            }
                          }
                          else { 
                            const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                            return "Video uploaded"
                          }
                    } else {
                        // const [fetch, checkExists] = await appDbController.Notifications.addPushMessageBulk(notify);
                        // if (checkExists == true) {
                        //   await FirebaseService.sendNotifications(notify);
                        //   return "Video uploaded"
                        // }
                        // else {
                        //     return "Video uploaded"
                        // }
                        return "Video uploaded"
                    }
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
            const page = Number(query.page) || 1;
            const pageSize = process.env.PAGINATION_PAGE_SIZE;
            const limit = page * pageSize;
                let allVideos=await appDbController.Shop.allVideos(token,query,limit)
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
            const page = Number(query.page) || 1;
            const pageSize = process.env.PAGINATION_PAGE_SIZE;
            const limit = page * pageSize;
            let data = {
                limit: limit,
            }
            const myVideos = await appDbController.Shop.mySavedVideos(token,data)
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
            const page = Number(query.page) || 1;
            const pageSize = process.env.PAGINATION_PAGE_SIZE;
            const limit = page * pageSize;
            let data = {
                limit: limit,
            }
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
    
    fetchCategoryBasedShop: async ({token,query}) => {
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
            return {
                profile: fetchUser.profilePic,
                userName: fetchUser.userName,
                category: category,
                reviewStatus:reviewAdded
           } 
        } else {
            return "Profile not found";
        }
    },

    deleteAccount: async ({ token }) => {
        const fetchUser = await appDbController.Profile.getProfile(token);
        if (fetchUser != null && fetchUser != undefined && Object.keys(fetchUser).length != 0) {
            const deleteAccount = await appDbController.Profile.deleteAccount(token)
            if (deleteAccount != null && deleteAccount != undefined && deleteAccount[0] != 0) {
                return "Account deleted"
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
            const page = Number(query.page) || 1;
            const pageSize = process.env.PAGINATION_PAGE_SIZE;
            const limit = page * pageSize;
            let data = {
                limit: limit,
            }            
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
    
};







