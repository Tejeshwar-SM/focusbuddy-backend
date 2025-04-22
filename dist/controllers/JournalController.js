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
exports.deleteJournalEntry = exports.updateJournalEntry = exports.createJournalEntry = exports.getJournalEntry = exports.getJournalEntries = void 0;
const Journal_1 = __importDefault(require("../models/Journal"));
// Get all journal entries for the current user
const getJournalEntries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const entries = yield Journal_1.default.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: entries
        });
    }
    catch (error) {
        console.error("Error fetching journal entries:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getJournalEntries = getJournalEntries;
// Get a single journal entry
const getJournalEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const entry = yield Journal_1.default.findOne({
            _id: req.params.id,
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
        });
        if (!entry) {
            res.status(404).json({ success: false, message: "Journal entry not found" });
            return;
        }
        res.json({
            success: true,
            data: entry
        });
    }
    catch (error) {
        console.error("Error fetching journal entry:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getJournalEntry = getJournalEntry;
// Create a new journal entry
const createJournalEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ success: false, message: "Title and content are required" });
            return;
        }
        const entry = yield Journal_1.default.create({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            title,
            content
        });
        res.status(201).json({
            success: true,
            data: entry
        });
    }
    catch (error) {
        console.error("Error creating journal entry:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.createJournalEntry = createJournalEntry;
// Update a journal entry
const updateJournalEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content } = req.body;
        const entry = yield Journal_1.default.findOneAndUpdate({ _id: req.params.id, user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, { title, content }, { new: true, runValidators: true });
        if (!entry) {
            res.status(404).json({ success: false, message: "Journal entry not found" });
            return;
        }
        res.json({
            success: true,
            data: entry
        });
    }
    catch (error) {
        console.error("Error updating journal entry:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.updateJournalEntry = updateJournalEntry;
// Delete a journal entry
const deleteJournalEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const entry = yield Journal_1.default.findOneAndDelete({
            _id: req.params.id,
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
        });
        if (!entry) {
            res.status(404).json({ success: false, message: "Journal entry not found" });
            return;
        }
        res.json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        console.error("Error deleting journal entry:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.deleteJournalEntry = deleteJournalEntry;
//# sourceMappingURL=JournalController.js.map