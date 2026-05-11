import { ApplicationResponse } from "../../../Core/inc/response/ApplicationResponse.js";
import { ApplicationResult } from "../../../Core/result.js";
import { managementMiddleware } from "../middleware/management.Middleware.js";

export class ManagementController { }

ManagementController.Management = {

    createCategory: async (req, res) => {
        managementMiddleware.Management.createCategory(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    deleteCategory: async (req, res) => {
        managementMiddleware.Management.deleteCategory(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    getCategory: async (req, res) => {
        managementMiddleware.Management.getCategory(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    addCategoryVideo: async (req, res) => {
        managementMiddleware.Management.addCategoryVideo(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    getCategoryVideo: async (req, res) => {
        managementMiddleware.Management.getCategoryVideo(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    getShop: async (req, res) => {
        managementMiddleware.Management.getShop(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    getShopDetails: async (req, res) => {
        managementMiddleware.Management.getShopDetails(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    getReportedShops: async (req, res) => {
        managementMiddleware.Management.getReportedShops(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    fetchBanners: async (req, res) => {
        managementMiddleware.Management.fetchBanners(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    addBanners: async (req, res) => {
        managementMiddleware.Management.addBanners(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    deleteBanner: async (req, res) => {
        managementMiddleware.Management.deleteBanner(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    fetchCategoryBanners: async (req, res) => {
        managementMiddleware.Management.fetchCategoryBanners(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    addCategoryBanners: async (req, res) => {
        managementMiddleware.Management.addCategoryBanners(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

    deleteCategoryBanner: async (req, res) => {
        managementMiddleware.Management.deleteCategoryBanner(req)
        .then((data) => {
            const response = ApplicationResult.forCreated();
            var statuscode = 0;
            ApplicationResponse.success(
                response,
                null,
                (response) => (statuscode = response.status)
            );
            res.json({ status: statuscode, data: data });
        })
        .catch((error) => {

            ApplicationResponse.error(error, null, (response) => {
                res.status(response.status).json(response);
            });
        });
    },

};
