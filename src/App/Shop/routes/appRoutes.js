import { Router } from "express";
import { appAuthenticate } from "../controller/authController.js";
import { appController } from "../controller/appController.js";
import * as Uploaders from "../../../Core/utils/imageResizer.js"
import { uploader } from "../../../Core/utils/imageResizer.js"

const appRouter = Router();

appRouter.post("/addNewCategory", appAuthenticate,appController.App.addNewCategory);

appRouter.post("/updateProfile", appAuthenticate,Uploaders.Resizer, appController.App.updateProfile);
appRouter.get("/getProfile", appAuthenticate, Uploaders.Resizer, appController.App.getProfile);

appRouter.get("/analytics", appAuthenticate, appController.App.analytics);

appRouter.get("/search",appAuthenticate,appController.App.search)

appRouter.get("/getCategoryVideos", appAuthenticate, appController.App.getCategoryVideos);

appRouter.get("/fetchCategoryBasedShop", appAuthenticate, Uploaders.Resizer, appController.App.fetchCategoryBasedShop);

appRouter.post("/shopRegister", appAuthenticate,uploader.fields([
    { name: "shopImage", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), Uploaders.GeneralResizer, appController.App.shopRegister);

appRouter.post("/deleteShopImage", appAuthenticate, appController.App.deleteShopImage)

appRouter.post("/saveShop", appAuthenticate, appController.App.saveShop)
appRouter.get("/fetchSavedShops", appAuthenticate, appController.App.fetchSavedShop)
  
appRouter.get("/fetchShop", appAuthenticate, appController.App.fetchShop);
  
appRouter.get("/deleteShop", appAuthenticate, appController.App.deleteShop);

appRouter.post("/getShopById", appAuthenticate, appController.App.getShopById);

appRouter.post("/videoRegister", appAuthenticate,Uploaders.videoResizer ,appController.App.videoRegister);
appRouter.post("/replaceVideo", appAuthenticate,Uploaders.videoResizer ,appController.App.replaceVideo);
appRouter.post("/updateVideoDetails", appAuthenticate ,appController.App.updateVideo);
appRouter.post("/deleteVideo", appAuthenticate ,appController.App.deleteVideo);
appRouter.get("/myVideos", appAuthenticate,appController.App.fetchVideo);
appRouter.get("/fetchVideoById", appAuthenticate,appController.App.fetchVideoById);

appRouter.get("/allVideos", appAuthenticate,appController.App.allVideos);

appRouter.post("/saveOthersVideos", appAuthenticate,appController.App.saveVideos);
appRouter.get("/fetchMySavedVideos", appAuthenticate, appController.App.mySavedVideos);

appRouter.post("/viewedVideos", appAuthenticate ,appController.App.viewedVideos);
appRouter.post("/addPoints", appAuthenticate ,appController.App.addPoints);
appRouter.get("/fetchMyViewedVideos", appAuthenticate, appController.App.fetchMyViewedVideos);

appRouter.get("/home", appAuthenticate, appController.App.home);

appRouter.get("/fetchPoints", appAuthenticate ,appController.App.points);

appRouter.get("/deleteAccount", appAuthenticate, appController.App.deleteAccount);

appRouter.post("/addReview", appAuthenticate, appController.App.addReview)

appRouter.post("/notificationPreference",appAuthenticate,appController.App.notificationPreference)
appRouter.get("/fetchNotificationPreference", appAuthenticate, appController.App.fetchNotificationPreference)

appRouter.get("/notificationsReadStatus", appAuthenticate, appController.App.notificationsReadStatus);
appRouter.get("/fetchNotifications", appAuthenticate, appController.App.fetchNotifications);
appRouter.get("/notificationCount", appAuthenticate, appController.App.notificationCount);
appRouter.get("/notificationOpenStatus", appAuthenticate, appController.App.notificationOpenStatus);

appRouter.get("/privacyPolicy", appAuthenticate, appController.App.privacyPolicy);
appRouter.get("/terms", appAuthenticate, appController.App.terms);



export { appRouter };