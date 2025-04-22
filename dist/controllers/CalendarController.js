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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarEvents = void 0;
const Task_1 = __importStar(require("../models/Task")); // Import the enum too
// Get all calendar events (tasks and events from Task model) within a date range
const getCalendarEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Parse date range from query params
        const { start, end } = req.query;
        if (!start || !end) {
            res
                .status(400)
                .json({ success: false, message: "Start and end dates are required" });
            return;
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            res.status(400).json({ success: false, message: "Invalid date format" });
            return;
        }
        // Fetch tasks and events from the Task model that overlap with the date range
        // Overlap condition:
        // - Starts before the range ends AND
        // - (Ends after the range starts OR is an all-day event starting within or before the range end)
        const calendarEntries = yield Task_1.default.find({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            start: { $lt: endDate }, // Starts before the end of the query range
            $or: [
                { end: { $gt: startDate } }, // Ends after the start of the query range (for timed events)
                { allDay: true, start: { $gte: startDate } } // Is all-day and starts within the query range
                // Note: Depending on how you handle all-day events spanning multiple days,
                // you might need a more complex query, but this covers most common cases.
                // A simpler overlap: { start: { $lt: endDate }, end: { $gt: startDate } } works if 'end' is always set.
                // Let's refine the overlap logic for robustness:
                // An entry overlaps if its start is before the range end AND its end is after the range start.
                // For all-day events, we treat their 'end' as start + 1 day conceptually for overlap.
                // Query: Find where entry.start < range.end AND (entry.end > range.start OR (entry.allDay AND entry.start < range.end))
            ]
            // Simpler Overlap Query (often sufficient):
            // start: { $lt: endDate }, // It must start before the range ends
            // $or: [
            //   { end: { $gt: startDate } }, // It must end after the range starts (for timed events)
            //   { allDay: true } // Or it's an all-day event (implicitly overlaps if start < endDate)
            // ]
        }).sort({ start: 1 }); // Sort by start time
        // Format the response - map directly from the fetched entries
        const formattedEvents = calendarEntries.map((entry) => ({
            id: entry._id,
            title: entry.title,
            start: entry.start,
            end: entry.end, // Will be undefined if allDay is true due to pre-save hook
            allDay: entry.allDay,
            description: entry.description,
            status: entry.status, // Only relevant for type 'task'
            priority: entry.priority, // Only relevant for type 'task'
            type: entry.type, // 'task' or 'event'
        }));
        // Send back a single array of events
        res.json({
            success: true,
            // Keep the structure consistent if frontend expects { tasks: [], sessions: [] }
            // Otherwise, simplify to data: formattedEvents
            data: {
                tasks: formattedEvents.filter(e => e.type === Task_1.CalendarEntryType.TASK),
                // Send an empty array for sessions, or adjust frontend to expect just 'events'
                events: formattedEvents.filter(e => e.type === Task_1.CalendarEntryType.EVENT),
                // OR simply: data: formattedEvents
            }
        });
    }
    catch (error) {
        console.error("Error fetching calendar events:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getCalendarEvents = getCalendarEvents;
//# sourceMappingURL=CalendarController.js.map