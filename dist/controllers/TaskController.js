"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskTime = exports.getTaskStats = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTask = exports.getTasks = void 0;
const Task_1 = __importStar(require("../models/Task")); // Import necessary types/enums
const mongoose_1 = __importDefault(require("mongoose"));
// Get all tasks (can optionally filter by type, status, etc.)
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Example: Allow filtering by type if needed
        const filter = { user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id };
        if (req.query.type &&
            Object.values(Task_1.CalendarEntryType).includes(req.query.type)) {
            filter.type = req.query.type;
        }
        const tasks = yield Task_1.default.find(filter).sort({ start: -1 }); // Sort by start date
        res.json({ success: true, count: tasks.length, data: tasks });
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getTasks = getTasks;
// Get a single task or event by ID
const getTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, message: "Invalid ID format" });
            return;
        }
        const task = yield Task_1.default.findOne({ _id: id, user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (!task) {
            res.status(404).json({ success: false, message: "Entry not found" });
            return;
        }
        res.json({ success: true, data: task });
    }
    catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getTask = getTask;
// Create a new task or event
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, type, // 'task' or 'event'
        start, end, allDay, priority, // Only for 'task'
        status, // Only for 'task'
        estimatedTime, // Only for 'task'
        // Add other relevant fields from your ITask interface
         } = req.body;
        // Basic validation
        if (!title || !type || !start) {
            res
                .status(400)
                .json({
                success: false,
                message: "Missing required fields (title, type, start)",
            });
            return;
        }
        if (!Object.values(Task_1.CalendarEntryType).includes(type)) {
            res
                .status(400)
                .json({ success: false, message: "Invalid type specified" });
            return;
        }
        const newTaskData = {
            user: new mongoose_1.default.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.id),
            title,
            description,
            type,
            start: new Date(start), // Ensure dates are Date objects
            allDay: allDay || false,
        };
        // Add end date if provided and not allDay
        if (end && !newTaskData.allDay) {
            newTaskData.end = new Date(end);
        }
        else {
            newTaskData.end = undefined; // Ensure end is undefined if allDay or not provided
        }
        // Add task-specific fields only if type is 'task'
        if (type === Task_1.CalendarEntryType.TASK) {
            newTaskData.priority = priority || Task_1.TaskPriority.MEDIUM; // Use default if not provided
            newTaskData.status = status || Task_1.TaskStatus.TODO; // Use default if not provided
            newTaskData.estimatedTime = estimatedTime;
            // remainingTime could be set equal to estimatedTime initially
            if (estimatedTime !== undefined) {
                newTaskData.remainingTime = estimatedTime;
            }
        }
        const task = yield Task_1.default.create(newTaskData);
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        console.error("Error creating task/event:", error);
        if (error.name === "ValidationError") {
            res
                .status(400)
                .json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }
        else {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }
});
exports.createTask = createTask;
// Update an existing task or event
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, message: "Invalid ID format" });
            return;
        }
        const task = yield Task_1.default.findOne({ _id: id, user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (!task) {
            res.status(404).json({ success: false, message: "Entry not found" });
            return;
        }
        // Use Object.assign and then save to trigger pre-save hooks
        // This ensures logic like clearing task fields if type changes to 'event' runs
        Object.assign(task, req.body);
        // Ensure date strings are converted back to Date objects if necessary
        if (req.body.start)
            task.start = new Date(req.body.start);
        if (req.body.end)
            task.end = new Date(req.body.end);
        // If allDay is explicitly set to true in the update, clear the end date
        if (req.body.allDay === true)
            task.end = undefined;
        // If allDay is set to false, and no end date provided, we might need specific logic
        // but usually the user would provide start/end times together when switching from allDay.
        const updatedTask = yield task.save(); // This triggers the pre-save hook in the model
        /* Alternative using findByIdAndUpdate (might not trigger pre-save as reliably for complex logic)
        const updatedTask = await Task.findByIdAndUpdate(
          id,
          req.body,
          { new: true, runValidators: true } // Return updated doc, run schema validators
        );
        */
        res.json({ success: true, data: updatedTask });
    }
    catch (error) {
        console.error("Error updating task/event:", error);
        if (error.name === "ValidationError") {
            res
                .status(400)
                .json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }
        else {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }
});
exports.updateTask = updateTask;
// Delete a task or event
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, message: "Invalid ID format" });
            return;
        }
        const task = yield Task_1.default.findOneAndDelete({ _id: id, user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (!task) {
            res.status(404).json({ success: false, message: "Entry not found" });
            return;
        }
        res.json({ success: true, message: "Entry deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting task/event:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.deleteTask = deleteTask;
// --- Other existing functions like getTaskStats, updateTaskTime ---
// Ensure updateTaskTime still makes sense or adjust if needed.
// If updateTaskTime was specific to Pomodoro-linked tasks, it might need removal or modification.
const getTaskStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const totalTasks = yield Task_1.default.countDocuments({
            user: userId,
            type: Task_1.CalendarEntryType.TASK,
        });
        const completedTasks = yield Task_1.default.countDocuments({
            user: userId,
            type: Task_1.CalendarEntryType.TASK,
            status: Task_1.TaskStatus.COMPLETED,
        });
        const pendingTasks = totalTasks - completedTasks;
        // Aggregate tasks by priority
        const priorityCounts = yield Task_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    type: Task_1.CalendarEntryType.TASK,
                },
            },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);
        // Aggregate tasks by status
        const statusCounts = yield Task_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    type: Task_1.CalendarEntryType.TASK,
                },
            },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        // Format counts for easier frontend use
        const formatCounts = (counts, possibleValues) => {
            const result = {};
            possibleValues.forEach((val) => (result[val] = 0)); // Initialize all possible values to 0
            counts.forEach((item) => {
                if (item._id) {
                    // Ensure _id is not null/undefined
                    result[item._id] = item.count;
                }
            });
            return result;
        };
        res.json({
            success: true,
            data: {
                totalTasks,
                completedTasks,
                pendingTasks,
                priority: formatCounts(priorityCounts, Object.values(Task_1.TaskPriority)),
                status: formatCounts(statusCounts, Object.values(Task_1.TaskStatus)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching task stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getTaskStats = getTaskStats;
// Assuming updateTaskTime is still relevant for tasks
const updateTaskTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { timeChange } = req.body; // Expecting timeChange in minutes (positive or negative)
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, message: "Invalid Task ID" });
            return;
        }
        if (typeof timeChange !== "number") {
            res
                .status(400)
                .json({ success: false, message: "Invalid timeChange value" });
            return;
        }
        const task = yield Task_1.default.findOne({
            _id: id,
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            type: Task_1.CalendarEntryType.TASK,
        });
        if (!task) {
            res
                .status(404)
                .json({ success: false, message: "Task not found or not accessible" });
            return;
        }
        // Initialize remainingTime if it doesn't exist, based on estimatedTime or 0
        if (task.remainingTime === undefined || task.remainingTime === null) {
            task.remainingTime = task.estimatedTime || 0;
        }
        // Update remaining time, ensuring it doesn't go below zero
        task.remainingTime = Math.max(0, task.remainingTime + timeChange);
        // Optionally update status if remaining time becomes 0
        if (task.remainingTime === 0 && task.status !== Task_1.TaskStatus.COMPLETED) {
            // Decide if reaching 0 time automatically completes the task
            // task.status = TaskStatus.COMPLETED;
        }
        yield task.save();
        res.json({ success: true, data: task });
    }
    catch (error) {
        console.error("Error updating task time:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.updateTaskTime = updateTaskTime;
//# sourceMappingURL=TaskController.js.map