"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TaskController_1 = require("../controllers/TaskController");
const Authentication_1 = require("../middleware/Authentication");
const router = express_1.default.Router();
// All routes are protected = require authentication
router.use(Authentication_1.protect);
// Get all tasks/events and create a task/event
router.route("/").get(TaskController_1.getTasks).post(TaskController_1.createTask);
// IMPORTANT: Put specific routes BEFORE parametric routes
router.get("/stats", TaskController_1.getTaskStats); // Stats endpoint for tasks
// Add route for updating task time (relevant only for type 'task')
router.route("/:id/update-time").put(TaskController_1.updateTaskTime);
// Removed the specific /complete route
// router.route("/:id/complete").put(completeTask);
// To complete a task, use the standard PUT /:id route with { status: 'completed' }
// Get, update, and delete a specific task/event
router.route("/:id").get(TaskController_1.getTask).put(TaskController_1.updateTask).delete(TaskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=TaskRoutes.js.map