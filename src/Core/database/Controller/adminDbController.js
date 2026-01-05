import express from "express";
import { connection } from "../connection.js";
import * as Models from "../models/index.js";
import require from "requirejs";
const { Op, Sequelize, where } = require("sequelize");
import * as Error from "../../errors/ErrorConstant.js"

export class adminDbController { }
adminDbController.scope = "defaultScope";
adminDbController.Models = Models;
adminDbController.connection = connection;
adminDbController.defaults = {};



adminDbController.Appconfigs = async () => {
  try {
    return await adminDbController.Models.config.findOne({
      raw: true,
    });
  } catch (error) {
    return null;
  }
};

adminDbController.Auth = {
  checkemailExists: async (data) => {
    try {
      return await adminDbController.Models.admin.findOne({
        where: {
          email: data.email,
        },
        raw: true,
      });
    } catch (error) {
      return null
    }
  },
  checkAdminExistsLogin: async (data) => {
    try {
      return await adminDbController.Models.admin.findOne({
        where: {
          [Op.or]: {
            email: data.email || null,
            phone: data.phone || null,
          },
        },
        raw: true,
      });
    } catch (error) {
return null    }
  },
  checkAdminExistsRegister: async (data) => {
    try {
      return await adminDbController.Models.admin.findOne({
        where: {
          [Op.or]: {
            email: data.email || null,
            phone: data.phone || null,
          },
        },
        raw: true,
      });
    } catch (error) {
return null    }
  },
  checkUserIdExists: async (data) => {
    try {
      return await adminDbController.Models.admin.findOne({
        where: {
          id: data.userId,
          status: "active"
        },
        attributes: ["id", "username"],
        raw: true,
      });
    } catch (error) {
      return null
    }
  },
  createUid: async (data) => {
    const code = Math.floor(100000 + Math.random() * 900000);
    try {
      const updated_data = await adminDbController.Models.customer.update(
        { code: code },
        { where: { id: data.id } },
        { plain: true, returning: true }
      );
      if (updated_data[0] == 1) {
        return adminDbController.Models.customer.findOne({
          where: { email: data.email },
          attributes: ["userName", "email", "code"],
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
      return await adminDbController.Models.customer.findOne({
        where: { email: data.email, code: data.code },
      });
    } catch (error) {
      return null
    }
  },
  updatePassword: async (data) => {
    try {
      return await adminDbController.Models.customer.update(
        {
          password: data.password,
          code: 0,
        },
        {
          where: { email: data.email },
        }
      );
    } catch (error) {
      return null
    }
  },
  session: {
    createSession: async (token, device, id) => {
      try {
        return await adminDbController.Models.adminAuth.create({
          adminId: id,
          token: token,
          ipv4: device.ip || device.ipv,
          userAgent: device.userAgent,
          status: "active",
        });
      } catch (error) {
        throw Error.InternalError("Unable to Create Session");
      }
    },
    findSession: async (token) => {
      try {
        return await adminDbController.Models.adminAuth.findOne({
          where: {
            token: token,
          }, raw: true
        })
      } catch (error) {
        return null
      }
    },
    findMySession: async (data) => {
      try {
        return await adminDbController.Models.adminAuth.findAll({
          where: {
            adminId: data.id,
            status: {
              [Op.ne]: "terminate"
            }
          },
          order: [["id", "DESC"]],
          raw: true,
          attributes: {
            exclude: ["token", "uid", "updatedAt"]
          }
        })
      } catch (error) {
        return null
      }
    },
    findSessionId: async (data) => {
      try {
        return await adminDbController.Models.adminAuth.findOne({
          where: {
            adminId: data.id,
          },
          order: [['id', 'DESC'],]
        })

      } catch (error) {
        return null
      }
    },
    findSessionById: async (data) => {
      try {
        return await adminDbController.Models.adminAuth.findOne({
          where: {
            id: data.id,
          },
          order: [['id', 'DESC'],]
        })

      } catch (error) {
        return null
      }
    },
    destroySession: async (token) => {
      try {
        return await adminDbController.Models.adminAuth.update({
          status: "inactive"
        },
          {
            where: {
              token: token,
            },
          })
      } catch (error) {
        return null
      }
    },
    deleteSession: async (data) => {
      try {
        return await adminDbController.Models.adminAuth.update({
          status: "terminate"
        },
          {
            where: {
              id: data.id,
            },
          })
      } catch (error) {
        return null
      }
    },
  },
};

adminDbController.Admin = {
  createAdmin: async (data) => {
    try {
      return await adminDbController.Models.admin.create({
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        status: "active",
      }, { raw: true })
    } catch (error) {
      return null
    }
  }
}

adminDbController.Category = {
  createCategory: async (data,image) => {
    try {
      return await adminDbController.Models.category.create({
        addedPerson:0,
        categoryName:data.categoryName,
        categoryType:data.categoryType,
        categoryImage:image,
      })
    } catch (error) {
      return null;
    }
  },

  getCategory: async () => {
    try {
      return await adminDbController.Models.category.findAll({
      raw:true
      })
    } catch (error) {
      return null;
    }
  },

  addCategoryVideo: async (data,video) => {
    try {
      return await adminDbController.Models.categoryVideo.create({
        categoryId:data.categoryId,
        categoryName:data.categoryName,
        categoryVideo:video,
      })
    } catch (error) {
      return null;
    }
  },

  getCategoryVideo: async () => {
    try {
      return await adminDbController.Models.categoryVideo.findAll({
      raw:true
      })
    } catch (error) {
      return null;
    }
  },

  getShop: async (data) => {
    try {
      return await adminDbController.Models.shop.findAll({
        where: {
          status:data.status
        },
      raw:true
      })
    } catch (error) {
      return null;
    }
  },

  getCategoryById: async (data) => {
    try {
      return await adminDbController.Models.category.findOne({
        where: {
          id: data.id,
          status:"active"
        },
        raw:true
      })
    } catch (error) {
      return null;
    }
  },

  deleteCategory: async (data) => {
    try {
      const updated = await adminDbController.Models.category.update(
        {
          status: data.status,
        },
        {
          where: {
            id: data.id,
          },
        }
      );
      if (updated[0] != 0) {
        return "Deleted successfully";
      } else {
        throw Error.SomethingWentWrong("Failed to delete");
      }
    } catch (error) {
      return null
    }
  },

}
