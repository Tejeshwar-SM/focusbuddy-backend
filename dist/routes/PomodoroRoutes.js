"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PomodoroSessionController_1 = require("../controllers/PomodoroSessionController");
const Authentication_1 = require("../middleware/Authentication");
const router = express_1.default.Router();
// All routes are protected = require authentication
router.use(Authentication_1.protect);
// Start a pomodoro session and get all sessions
router.route("/").post(PomodoroSessionController_1.startSession).get(PomodoroSessionController_1.getSessions);
// Get stats for a specific date (or today)
router.get("/stats", PomodoroSessionController_1.getStats);
// Get daily stats for the contribution graph (e.g., last year)
router.get("/daily-stats", PomodoroSessionController_1.getDailyStats); // Add the new route
// Add dedicated route for completing a session (to match frontend expectation)
router.route("/:id/complete").put(PomodoroSessionController_1.completeSession);
// Add dedicated route for cancelling a session
router.route("/:id/cancel").put(PomodoroSessionController_1.cancelSession); // Changed from delete to put to match frontend service
// Original route: update or cancel a session - REMOVED cancel from here as it has its own route now
// If update is needed for other fields, keep it, otherwise remove this route.
// For now, assuming only complete/cancel are needed via dedicated routes.
// router.route("/:id").put(updateSession); // Example if update is needed
exports.default = router;
//# sourceMappingURL=PomodoroRoutes.js.map