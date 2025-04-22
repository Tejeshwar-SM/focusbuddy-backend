"use strict";
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
exports.emitLeaderboardUpdate = exports.updateLeaderboardForUser = exports.getUserRanking = exports.getLeaderboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Leaderboard_1 = __importDefault(require("../models/Leaderboard"));
const PomodoroSession_1 = __importDefault(require("../models/PomodoroSession"));
const Task_1 = __importDefault(require("../models/Task"));
const date_fns_1 = require("date-fns");
const server_1 = require("../server"); // Fixed import path to server.ts
/**
 * Get the leaderboard data based on period filter
 */
const getLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { period = "all", limit = 10 } = req.query;
        const limitNum = Number(limit);
        let sortField;
        if (period === "weekly") {
            sortField = "weeklyScore";
        }
        else if (period === "daily") {
            sortField = "dailyScore";
        }
        else {
            sortField = "totalFocusTime";
        }
        // Get leaderboard data and populate user info
        const leaderboard = yield Leaderboard_1.default.find({})
            .populate("user", "name email")
            .sort({ [sortField]: -1 })
            .limit(limitNum);
        // Add rank to each entry
        const leaderboardWithRanks = leaderboard.map((entry, index) => (Object.assign(Object.assign({}, entry.toObject()), { rank: index + 1 })));
        res.status(200).json({
            success: true,
            data: leaderboardWithRanks,
        });
    }
    catch (error) {
        console.error("Error getting leaderboard:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get leaderboard data",
            error: error.message,
        });
    }
});
exports.getLeaderboard = getLeaderboard;
/**
 * Get the current user's ranking on the leaderboard
 */
const getUserRanking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // @ts-ignore - Adding req.user from the auth middleware
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { period = "all" } = req.query;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User ID not found in request",
            });
            return;
        }
        let sortField;
        if (period === "weekly") {
            sortField = "weeklyScore";
        }
        else if (period === "daily") {
            sortField = "dailyScore";
        }
        else {
            sortField = "totalFocusTime";
        }
        // Get all users sorted by the appropriate field
        const allUsers = yield Leaderboard_1.default.find({}).sort({ [sortField]: -1 });
        // Find the user and their position in the rankings
        const userRank = allUsers.findIndex((entry) => entry.user.toString() === userId) + 1;
        // Get the user's leaderboard entry with user details
        const userEntry = yield Leaderboard_1.default.findOne({ user: userId }).populate("user", "name email");
        if (!userEntry) {
            res.status(404).json({
                success: false,
                message: "User not found on leaderboard",
            });
            return;
        }
        // Add rank to user entry
        const userRanking = Object.assign(Object.assign({}, userEntry.toObject()), { rank: userRank || 0 });
        res.status(200).json({
            success: true,
            data: userRanking,
        });
    }
    catch (error) {
        console.error("Error getting user ranking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get user ranking",
            error: error.message,
        });
    }
});
exports.getUserRanking = getUserRanking;
/**
 * Update the leaderboard data for a specific user
 * This is called when a session is completed/cancelled
 */
const updateLeaderboardForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Updating leaderboard for user: ${userId}`);
        // Get current date values for filtering
        const now = new Date();
        const weekStart = (0, date_fns_1.startOfWeek)(now);
        const weekEnd = (0, date_fns_1.endOfWeek)(now);
        const dayStart = (0, date_fns_1.startOfDay)(now);
        const dayEnd = (0, date_fns_1.endOfDay)(now);
        console.log(`Week range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
        console.log(`Day range: ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);
        // Get all completed sessions for the user
        const sessions = yield PomodoroSession_1.default.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: "completed",
        });
        console.log(`Found ${sessions.length} completed sessions for user`);
        // Get all completed tasks for the user
        const completedTasks = yield Task_1.default.countDocuments({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: "completed",
        });
        // Calculate total focus time (all time)
        const totalFocusTime = sessions.reduce((sum, session) => sum + session.duration, 0);
        console.log(`Total focus time: ${totalFocusTime} minutes`);
        // Calculate weekly score - sessions within this week
        const weeklyScore = sessions.reduce((sum, session) => {
            // Ensure we have a valid date object
            const sessionStartTime = session.startTime
                ? new Date(session.startTime)
                : new Date(session.createdAt);
            // Check if session is within this week's range
            if ((0, date_fns_1.isWithinInterval)(sessionStartTime, { start: weekStart, end: weekEnd })) {
                return sum + session.duration;
            }
            return sum;
        }, 0);
        console.log(`Weekly score: ${weeklyScore} minutes`);
        // Calculate daily score - sessions from today
        const dailyScore = sessions.reduce((sum, session) => {
            // Ensure we have a valid date object
            const sessionStartTime = session.startTime
                ? new Date(session.startTime)
                : new Date(session.createdAt);
            // Check if session is within today's range
            if ((0, date_fns_1.isWithinInterval)(sessionStartTime, { start: dayStart, end: dayEnd })) {
                return sum + session.duration;
            }
            return sum;
        }, 0);
        console.log(`Daily score: ${dailyScore} minutes`);
        // Find and update or create the leaderboard entry
        const updatedEntry = yield Leaderboard_1.default.findOneAndUpdate({ user: new mongoose_1.default.Types.ObjectId(userId) }, {
            $set: {
                totalFocusTime,
                weeklyScore,
                dailyScore,
                completedSessions: sessions.length,
                completedTasks,
                lastUpdated: now,
            },
        }, { upsert: true, new: true });
        console.log(`Leaderboard updated for user: ${userId}`);
        console.log(`Updated entry: ${JSON.stringify({
            totalFocusTime: updatedEntry.totalFocusTime,
            weeklyScore: updatedEntry.weeklyScore,
            dailyScore: updatedEntry.dailyScore,
        })}`);
        // Emit leaderboard update to all clients
        yield (0, exports.emitLeaderboardUpdate)();
    }
    catch (error) {
        console.error("Error updating leaderboard for user:", error);
    }
});
exports.updateLeaderboardForUser = updateLeaderboardForUser;
// Function to emit leaderboard updates to all connected clients
const emitLeaderboardUpdate = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get top leaderboard entries for each period
        const allTimeLeaderboard = yield Leaderboard_1.default.find({})
            .populate("user", "name email")
            .sort({ totalFocusTime: -1 })
            .limit(10);
        const weeklyLeaderboard = yield Leaderboard_1.default.find({})
            .populate("user", "name email")
            .sort({ weeklyScore: -1 })
            .limit(10);
        const dailyLeaderboard = yield Leaderboard_1.default.find({})
            .populate("user", "name email")
            .sort({ dailyScore: -1 })
            .limit(10);
        // Add ranks
        const allTimeWithRanks = allTimeLeaderboard.map((entry, i) => (Object.assign(Object.assign({}, entry.toObject()), { rank: i + 1 })));
        const weeklyWithRanks = weeklyLeaderboard.map((entry, i) => (Object.assign(Object.assign({}, entry.toObject()), { rank: i + 1 })));
        const dailyWithRanks = dailyLeaderboard.map((entry, i) => (Object.assign(Object.assign({}, entry.toObject()), { rank: i + 1 })));
        // Log the data we're emitting
        console.log(`Emitting leaderboard update: 
      allTime entries: ${allTimeWithRanks.length}
      weekly entries: ${weeklyWithRanks.length}
      daily entries: ${dailyWithRanks.length}
    `);
        // Emit to all connected clients
        server_1.io.emit("leaderboardUpdate", {
            allTime: allTimeWithRanks,
            weekly: weeklyWithRanks,
            daily: dailyWithRanks,
        });
    }
    catch (error) {
        console.error("Error emitting leaderboard update:", error);
    }
});
exports.emitLeaderboardUpdate = emitLeaderboardUpdate;
//# sourceMappingURL=LeaderboardController.js.map