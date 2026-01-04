import require from "requirejs";
import { adminDbController } from "../../../Core/database/Controller/adminDbController.js";
var CryptoJS = require("crypto-js");
import * as Error from "../../../Core/errors/ErrorConstant.js"

export class managementMiddleware { }


managementMiddleware.Management = {

  createCategory: async ({body,image}) => {
    const created = await adminDbController.Category.createCategory(body, image)
    if (created != null && created != undefined && Object.keys(created).length != 0) {
      return "Category created"
    } else {
       throw Error.SomethingWentWrong("Failed to create category")
    }
  },

  deleteCategory: async ({body}) => {
    const fetchCat = await adminDbController.Category.getCategoryById(body)
    if (fetchCat != null && fetchCat != undefined && Object.keys(fetchCat).length != 0) {
    const deleteCat = await adminDbController.Category.deleteCategory(body);
    if (deleteCat != null && deleteCat != undefined && Object.keys(deleteCat).length != 0) {
      return deleteCat
    } else {
      throw Error.SomethingWentWrong("Failed to delete category")
    }
    } else {
      return "Category not found"
    }
  },
  
  getCategory: async () => {
    const get = await adminDbController.Category.getCategory()
    if (get != null && get != undefined && Object.keys(get).length != 0) {
      return get
    } else {
       return "Caterogies not found"
    }
  },
  
  addCategoryVideo: async ({body,video}) => {
    const created = await adminDbController.Category.addCategoryVideo(body, video)
    if (created != null && created != undefined && Object.keys(created).length != 0) {
      return "Category video added"
    } else {
       throw Error.SomethingWentWrong("Failed to add category video")
    }
  },

  getCategoryVideo: async () => {
    const get = await adminDbController.Category.getCategoryVideo()
    if (get != null && get != undefined && Object.keys(get).length != 0) {
      return get
    } else {
       return "Caterogies not found"
    }
  },

  getShop: async ({query}) => {
    const getShop = await adminDbController.Category.getShop(query)
    if (getShop != null && getShop != undefined && Object.keys(getShop).length != 0) {
      return getShop
    } else {
       return "Shops not found"
    }
  },


}