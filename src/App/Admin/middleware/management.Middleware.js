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
  
  addCategoryVideo: async ({body,video,thumbnail}) => {
    const created = await adminDbController.Category.addCategoryVideo(body, video, thumbnail)
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

  getShopDetails: async ({query}) => {     
            const checkShop = await adminDbController.Shop.getShopById(query)
            if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
                const shopVideos = await adminDbController.Shop.shopVideos(query)
                if (shopVideos != null && shopVideos != undefined && shopVideos.length != 0) {
                  return { shop: checkShop, shopVideos: shopVideos }
                }
                else {
                    return {shop:checkShop,shopVideos:[]}
                }
            } else {
                return "Shop not found"
            }            
  },

  getReportedShops: async () => {     
          const checkShop = await adminDbController.Shop.getReportedShops()
          if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
          // let ids = []
          // ids=checkShop.map(v=>v.shopId)
          const reportedShops = await adminDbController.Shop.reportedShops(checkShop)
            if (reportedShops != null && reportedShops != undefined && reportedShops.length != 0) {
                  return  reportedShops
                }
                else {
                    return []
                }
          } else {
              return "Reported shops not found"
            }          
        
  },

  getIssueReports: async () => {     
          const checkShop = await adminDbController.Shop.getIssueReports()
    if (checkShop != null && checkShop != undefined && Object.keys(checkShop).length != 0) {
            return checkShop
          // let ids = []
          // ids=checkShop.map(v=>v.shopId)
          } else {
              return "Issue reports not found"
            }          
        
  },

  fetchBanners: async () => {     
          const fetchBanners = await adminDbController.Banners.fetchBanners()
          if (fetchBanners != null && fetchBanners != undefined && Object.keys(fetchBanners).length != 0) {
             return fetchBanners
          } else {
              return "Banners not found"
            }       
        
  },

  addBanners: async ({body,images}) => {     
    // console.log("images ",req)
    const checkBanner = await adminDbController.Banners.checkBanner(body)
    console.log("check ",body)
    console.log("image ",images)
    if (checkBanner != null && checkBanner != undefined && (checkBanner).length != 0) {
                          return "This banner already exists"
          } else {
    const addBanners = await adminDbController.Banners.addBanners(body,images)
            if (addBanners != null && addBanners != undefined && addBanners.length != 0) {
                  return  "Banner added successfully"
                }
                else {
              throw Error.SomethingWentWrong("Failed to add banner")
            }
                      }          
        
  },

  deleteBanner: async ({query}) => {     
          const checkBanner = await adminDbController.Banners.checkBannerId(query)
          if (checkBanner != null && checkBanner != undefined && Object.keys(checkBanner).length != 0) {
          const deleteBanner = await adminDbController.Banners.deleteBanner(query)
            if (deleteBanner != null && deleteBanner != undefined && deleteBanner.length != 0&&deleteBanner[0]!=0) {
                  return  "Banner updated"
                }
                else {
                  throw Error.SomethingWentWrong("Failed to delete banner")
                }
          } else {
              return "Banner not found"
            }          
  },

  fetchCategoryBanners: async () => {     
          const fetchCategoryBanners = await adminDbController.Banners.fetchCategoryBanners()
          if (fetchCategoryBanners != null && fetchCategoryBanners != undefined && Object.keys(fetchCategoryBanners).length != 0) {
             return fetchCategoryBanners
          } else {
              return "Banners not found"
            }       
        
  },

  addCategoryBanners: async ({body,images}) => {     
    // console.log("images ",req)
    const checkBanner = await adminDbController.Banners.checkCategoryBanner(body)
    console.log("check ",body)
    console.log("image ",images)
    if (checkBanner != null && checkBanner != undefined && (checkBanner).length != 0) {
                          return "This banner already exists"
          } else {
    const addCategoryBanners = await adminDbController.Banners.addCategoryBanners(body,images)
            if (addCategoryBanners != null && addCategoryBanners != undefined && addCategoryBanners.length != 0) {
                  return  "Banner added successfully"
                }
                else {
              throw Error.SomethingWentWrong("Failed to add banner")
            }
                      }          
        
  },

  deleteCategoryBanner: async ({query}) => {     
          const checkBanner = await adminDbController.Banners.checkCategoryBannerId(query)
          if (checkBanner != null && checkBanner != undefined && Object.keys(checkBanner).length != 0) {
          const deleteCategoryBanner = await adminDbController.Banners.deleteCategoryBanner(query)
            if (deleteCategoryBanner != null && deleteCategoryBanner != undefined && deleteCategoryBanner.length != 0&&deleteCategoryBanner[0]!=0) {
                  return  "Banner updated"
                }
                else {
                  throw Error.SomethingWentWrong("Failed to delete banner")
                }
          } else {
              return "Banner not found"
            }          
        
  },
}