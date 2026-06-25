import { Router } from 'express'
import { adminAuthenticate } from '../controller/auth.Controller.js';
import { ManagementController } from '../controller/management.Controller.js';
import * as Upload from "../../../Core/utils/imageResizer.js"
import { uploader } from "../../../Core/utils/imageResizer.js"


const managementRouter = Router()


// Staff
managementRouter.post("/addCategory",adminAuthenticate,Upload.Resizer,ManagementController.Management.createCategory);
managementRouter.post("/deleteCategory",adminAuthenticate,ManagementController.Management.deleteCategory);
managementRouter.get("/getCategory", adminAuthenticate, ManagementController.Management.getCategory);

managementRouter.post("/addCategoryVideo",adminAuthenticate,Upload.videoResizer,ManagementController.Management.addCategoryVideo);
managementRouter.get("/getCategoryVideos",adminAuthenticate,ManagementController.Management.getCategoryVideo);
managementRouter.get("/getShop",adminAuthenticate,ManagementController.Management.getShop);
managementRouter.get("/getShopDetails",adminAuthenticate,ManagementController.Management.getShopDetails);
managementRouter.get("/getReportedShops", adminAuthenticate, ManagementController.Management.getReportedShops);
managementRouter.post("/changeReportedShopsStatus", adminAuthenticate, ManagementController.Management.reportedShopsStatus);

managementRouter.get("/getIssueReports", adminAuthenticate, ManagementController.Management.getIssueReports);

//Banners
managementRouter.get("/fetchBanners",adminAuthenticate,ManagementController.Management.fetchBanners);
managementRouter.post("/addBanners",adminAuthenticate,uploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "image", maxCount: 1 },,
]), Upload.bannerResizer,ManagementController.Management.addBanners);
managementRouter.get("/deleteBanner",adminAuthenticate,ManagementController.Management.deleteBanner);

//Contact us
managementRouter.get("/getContact", adminAuthenticate, ManagementController.Management.getContact);

//Category Banners
managementRouter.get("/fetchCategoryBanners",adminAuthenticate,ManagementController.Management.fetchCategoryBanners);
managementRouter.post("/addCategoryBanners",adminAuthenticate,uploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "image", maxCount: 1 },,
]), Upload.bannerResizer,ManagementController.Management.addCategoryBanners);
managementRouter.get("/deleteCategoryBanner",adminAuthenticate,ManagementController.Management.deleteCategoryBanner);




export { managementRouter }