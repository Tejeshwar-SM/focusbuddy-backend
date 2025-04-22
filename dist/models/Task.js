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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarEntryType = exports.TaskStatus = exports.TaskPriority = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Task priorities enum (relevant for type 'task')
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
// Task status enum (relevant for type 'task')
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "inProgress";
    TaskStatus["COMPLETED"] = "completed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
// Type of calendar entry
var CalendarEntryType;
(function (CalendarEntryType) {
    CalendarEntryType["TASK"] = "task";
    CalendarEntryType["EVENT"] = "event";
})(CalendarEntryType || (exports.CalendarEntryType = CalendarEntryType = {}));
// Create Task Schema
const TaskSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: [true, "Please provide a title"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        enum: Object.values(CalendarEntryType),
        required: true,
        default: CalendarEntryType.TASK, // Default to Task if not specified
    },
    start: {
        type: Date,
        required: [true, "Please provide a start date/time"],
    },
    end: {
        type: Date,
        // End date must be after start date if provided and not allDay
        validate: [
            function (value) {
                if (value && !this.allDay && this.start) {
                    return value > this.start;
                }
                return true;
            },
            'End date must be after start date for non-all-day events.'
        ]
    },
    allDay: {
        type: Boolean,
        required: true,
        default: false,
    },
    priority: {
        type: String,
        enum: Object.values(TaskPriority),
        // Default only makes sense if type is 'task', handled in controller logic
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        // Default only makes sense if type is 'task', handled in controller logic
    },
    estimatedTime: {
        type: Number,
        min: 0,
    },
    remainingTime: {
        type: Number,
        min: 0,
    },
}, { timestamps: true });
// Index for common queries
TaskSchema.index({ user: 1, start: 1 });
TaskSchema.index({ user: 1, end: 1 });
TaskSchema.index({ user: 1, type: 1 });
// Ensure end is unset if allDay is true
TaskSchema.pre('save', function (next) {
    if (this.isModified('allDay') && this.allDay) {
        this.end = undefined;
    }
    // Set default priority/status if type is task and they are not set
    if (this.type === CalendarEntryType.TASK) {
        if (!this.priority) {
            this.priority = TaskPriority.MEDIUM;
        }
        if (!this.status) {
            this.status = TaskStatus.TODO;
        }
    }
    else {
        // Ensure task-specific fields are unset if type is event
        this.priority = undefined;
        this.status = undefined;
        this.estimatedTime = undefined;
        this.remainingTime = undefined;
    }
    next();
});
exports.default = mongoose_1.default.model("Task", TaskSchema);
//# sourceMappingURL=Task.js.map