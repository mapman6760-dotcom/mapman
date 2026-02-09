import express from "express";
import cors from "cors";
import chalk from "chalk";
import path from "path";
const __dirname = path.resolve();
import helmet from "helmet";
import * as config from "./config/config.js";
import { setup } from "./src/Core/setup.js";
import { Logger } from "./src/Core/lib/logger.js";
import dotenv from "dotenv";
dotenv.config();

//require routers
import { shopRouter } from "./src/App/Shop/routes/index.js";
import { adminRouter } from "./src/App/Admin/routes/index.Routes.js";

const app = express();

//Enable cross origin policy
app.use(cors({ origin: "*", optionsSuccessStatus: 200, methods: "GET,POST,PUT", preflightContinue: false, credentials: true, }));

app.set("view engine", "ejs");
app.set("views", "./src/Core/views/ui/");
app.use(express.static("pages"));

app.use("/images", express.static(path.join(__dirname, "./assets/compressed/images/")));
app.use("/videos", express.static(path.join(__dirname, "./assets/compressed/videos/")));
app.use("/classroom", express.static(path.join(__dirname, "./assets/compressed/classroom/")));
app.use("/events", express.static(path.join(__dirname, "./assets/compressed/events/")));
app.use("/gallery", express.static(path.join(__dirname, "./assets/compressed/gallery/")));
app.use("/privacyPolicy", express.static(path.join(__dirname,"./privacy.html")));
app.use("/terms-and-condtions", express.static(path.join(__dirname,"./termAndConditions.html")));

//Parsing incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Security
app.use(helmet());

//Routers
app.use("/admin", adminRouter);
app.use("/shop", shopRouter);

//Check Status
app.use('/status', async (req, res) => { res.json({ data: `${process.env.APP_NAME} API is Now Live`,image:'https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg' }) });

//404 Handlers
app.get("/", async (req, res) => {
    res.status(404).render("404", { message: "Unable to find the requested resource", name: process.env.APP_NAME });
});

app.use(function (req, res, next) {
    res.status(404).render("404", { message: "Unable to find the requested resource", name: process.env.APP_NAME });
});
const AppConfig = config.mode === "production" ? config.production : config.development;
console.log("config mode   ",config.mode)
console.log("app ",AppConfig)
setup(AppConfig).then((config) => {
    const PORT = process.env.PORT || config.server.port || 3000;

    app.listen(PORT, () => {
        Logger.info(
          chalk.yellow(`${config.database.appName} API Listening on port ${PORT} ✔️ ✔️ ✔️`)
        );
    });
}).catch((error) => {
    Logger.error(JSON.stringify(error));
    process.abort();
}
);
