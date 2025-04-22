"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CalendarController_1 = require("../controllers/CalendarController");
const Authentication_1 = require("../middleware/Authentication");
const router = express_1.default.Router();
// All routes are protected
router.use(Authentication_1.protect);
// Get events for calendar view
router.get("/events", CalendarController_1.getCalendarEvents);
exports.default = router;
//# sourceMappingURL=CalendarRoutes.js.map