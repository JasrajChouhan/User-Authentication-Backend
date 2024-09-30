"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serverConfig_1 = __importDefault(require("./config/serverConfig"));
const appMiddleware_1 = __importDefault(require("./middlewares/appMiddleware"));
const AllApiVersionRoutes_1 = __importDefault(require("./routes/AllApiVersionRoutes"));
const dbConnection_1 = __importDefault(require("./db/dbConnection"));
const app = (0, express_1.default)();
const port = serverConfig_1.default.PORT || 3000;
//----------All middleware of app
(0, appMiddleware_1.default)(app);
//-----db connection
(0, dbConnection_1.default)();
app.use('/api', AllApiVersionRoutes_1.default);
function serverReadyOrStart() {
    app.listen(port, () => {
        console.log(`server is listen at ${port}`);
    });
}
serverReadyOrStart();
