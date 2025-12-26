import { Router } from 'express'
import { adminAuthenticate } from '../controller/auth.Controller.js';
import { ManagementController } from '../controller/management.Controller.js';
import * as Upload from "../../../Core/utils/imageResizer.js"


const managementRouter = Router()


// Staff
managementRouter.post("/addCategory",adminAuthenticate,Upload.Resizer,ManagementController.Management.createCategory);
managementRouter.post("/deleteCategory",adminAuthenticate,ManagementController.Management.deleteCategory);
managementRouter.get("/getCategory", adminAuthenticate, ManagementController.Management.getCategory);

managementRouter.post("/addCategoryVideo",adminAuthenticate,Upload.videoResizer,ManagementController.Management.addCategoryVideo);
managementRouter.get("/getCategoryVideos",adminAuthenticate,ManagementController.Management.getCategoryVideo);


export { managementRouter }