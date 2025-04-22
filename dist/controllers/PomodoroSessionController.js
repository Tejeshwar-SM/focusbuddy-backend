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
exports.getDailyStats = exports.getStats = exports.getSessions = exports.cancelSession = exports.completeSession = exports.startSession = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PomodoroSession_1 = __importStar(require("../models/PomodoroSession"));
const LeaderboardController_1 = require("./LeaderboardController");
//start a new pomodoro session
const startSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Destructure all expected fields from body
        const { duration, type, taskId } = req.body;
        // Validate required fields
        if (!duration || duration < 1) {
            res.status(400).json({ success: false, message: "Duration is required and must be at least 1" });
            return;
        }
        if (!type || !Object.values(PomodoroSession_1.SessionType).includes(type)) {
            res.status(400).json({ success: false, message: "Valid session type ('focus', 'short', 'long') is required" });
            return;
        }
        // Construct session data
        const sessionData = {
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? new mongoose_1.default.Types.ObjectId(req.user.id) : undefined,
            startTime: new Date(),
            duration,
            status: PomodoroSession_1.SessionStatus.IN_PROGRESS,
            completedCycles: 0,
            type: type,
        };
        // Add taskId only if provided and valid (optional basic check)
        if (taskId && mongoose_1.default.Types.ObjectId.isValid(taskId)) {
            sessionData.taskId = new mongoose_1.default.Types.ObjectId(taskId);
        }
        else if (taskId) {
            console.warn(`Invalid taskId format received: ${taskId}`); // Log invalid IDs
        }
        const session = yield PomodoroSession_1.default.create(sessionData);
        res.status(201).json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error("Couldn't start session", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.startSession = startSession;
//complete a pomodoro session
const completeSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const session = yield PomodoroSession_1.default.findOne({
            _id: req.params.id,
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? new mongoose_1.default.Types.ObjectId(req.user.id) : undefined,
            status: PomodoroSession_1.SessionStatus.IN_PROGRESS,
        });
        if (!session) {
            res.status(404).json({ success: false, message: "Session not found or not in progress" });
            return;
        }
        session.status = PomodoroSession_1.SessionStatus.COMPLETED;
        session.endTime = new Date();
        // Only update cycles if provided, otherwise keep existing
        if (req.body.completedCycles !== undefined) {
            session.completedCycles = Number(req.body.completedCycles); // Ensure it's a number
        }
        yield session.save();
        if ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) {
            yield (0, LeaderboardController_1.updateLeaderboardForUser)(req.user.id);
        }
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error("Couldn't complete session", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.completeSession = completeSession;
//cancel a pomodoro session
const cancelSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const session = yield PomodoroSession_1.default.findOne({
            _id: req.params.id,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            status: PomodoroSession_1.SessionStatus.IN_PROGRESS,
        });
        if (!session) {
            res.status(404).json({ success: false, message: "Session not found or not in progress" });
            return;
        }
        session.status = PomodoroSession_1.SessionStatus.CANCELLED;
        session.endTime = new Date();
        yield session.save();
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error("Couldn't cancel session", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.cancelSession = cancelSession;
//get user's pomodoro sessions
const getSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        let query = PomodoroSession_1.default.find({
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? new mongoose_1.default.Types.ObjectId(req.user.id) : undefined,
        })
            .sort({ startTime: -1 })
            .populate('taskId', 'title');
        if (limit) {
            query = query.limit(limit);
        }
        const sessions = yield query.exec();
        res.json({
            success: true,
            data: sessions,
        });
    }
    catch (error) {
        console.error("Couldn't get sessions", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getSessions = getSessions;
// Get stats (keep as is or refine if needed)
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { date } = req.query;
        console.log("Stats requested with date param:", date);
        // Get today's date (midnight)
        const targetDate = date ? new Date(date) : new Date();
        // Reset time to start of day (midnight)
        targetDate.setHours(0, 0, 0, 0);
        // Create date for end of day (next day midnight)
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);
        console.log("Filtering sessions between:", targetDate, "and", nextDay);
        // Build match criteria to get COMPLETED FOCUS sessions for this user on the target date
        const matchCriteria = {
            userId: new mongoose_1.default.Types.ObjectId(String((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)),
            status: PomodoroSession_1.SessionStatus.COMPLETED,
            type: PomodoroSession_1.SessionType.FOCUS, // Only count focus time for daily stats
            startTime: { $gte: targetDate, $lt: nextDay }
        };
        // Get count of completed sessions
        const totalCompletedSessions = yield PomodoroSession_1.default.countDocuments(matchCriteria);
        // Calculate total focus time using aggregation
        const focusTimeResult = yield PomodoroSession_1.default.aggregate([
            { $match: matchCriteria },
            { $group: {
                    _id: null,
                    totalDuration: { $sum: "$duration" }
                }
            }
        ]);
        // Format the response data
        const stats = {
            totalCompletedSessions,
            totalFocusTime: focusTimeResult.length > 0 ? focusTimeResult[0].totalDuration : 0,
            date: targetDate.toISOString().split('T')[0] // Return the date we used for reference
        };
        console.log("Returning stats:", stats);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error("Couldn't get stats", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getStats = getStats;
// Get daily focus time stats for the contribution graph
const getDailyStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "User not authenticated" });
            return;
        }
        // Calculate the date range (e.g., last 365 days)
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999); // End of today
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 364); // Go back 364 days to get 365 days total
        startDate.setHours(0, 0, 0, 0); // Start of that day
        // Aggregate completed FOCUS sessions within the date range, grouped by day
        const dailyStats = yield PomodoroSession_1.default.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    status: PomodoroSession_1.SessionStatus.COMPLETED,
                    type: PomodoroSession_1.SessionType.FOCUS,
                    startTime: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$startTime", timezone: "UTC" }, // Group by date string YYYY-MM-DD in UTC
                    },
                    totalDuration: { $sum: "$duration" }, // Sum duration for each day
                },
            },
            {
                $project: {
                    _id: 0, // Remove the default _id
                    date: "$_id", // Rename _id to date
                    totalDuration: 1,
                },
            },
            {
                $sort: { date: 1 }, // Sort by date ascending
            },
        ]);
        res.json({
            success: true,
            data: dailyStats, // Returns an array like [{ date: "YYYY-MM-DD", totalDuration: number }]
        });
    }
    catch (error) {
        console.error("Couldn't get daily stats", error);
        res.status(500).json({ success: false, message: "Server Error fetching daily stats" });
    }
});
exports.getDailyStats = getDailyStats;
//# sourceMappingURL=PomodoroSessionController.js.map