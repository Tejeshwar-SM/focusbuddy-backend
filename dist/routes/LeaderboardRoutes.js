"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LeaderboardController_1 = require("../controllers/LeaderboardController");
const Authentication_1 = require("../middleware/Authentication");
const router = express_1.default.Router();
// All routes are protected
router.use(Authentication_1.protect);
// Get global leaderboard
router.get("/", LeaderboardController_1.getLeaderboard);
// Get current user's ranking
router.get("/me", LeaderboardController_1.getUserRanking);
exports.default = router;
//# sourceMappingURL=LeaderboardRoutes.js.map