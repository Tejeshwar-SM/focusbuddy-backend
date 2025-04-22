"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const Authentication_1 = require("../middleware/Authentication");
const router = express_1.default.Router();
//Register a new user POST /api/auth/register
router.post("/register", AuthController_1.register);
//login user POST /api/auth/login
router.post("/login", AuthController_1.login);
router.get("/me", Authentication_1.protect, AuthController_1.getCurrentUser);
//POST /api/auth/refresh to refresh accesss token
router.post("/refresh", AuthController_1.refreshAccessToken);
//POST /api/auth/logout to logout user
router.post("/logout", AuthController_1.logout);
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map