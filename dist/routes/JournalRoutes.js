"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Authentication_1 = require("../middleware/Authentication");
const JournalController_1 = require("../controllers/JournalController");
const router = express_1.default.Router();
router.route("/")
    .get(Authentication_1.protect, JournalController_1.getJournalEntries)
    .post(Authentication_1.protect, JournalController_1.createJournalEntry);
router.route("/:id")
    .get(Authentication_1.protect, JournalController_1.getJournalEntry)
    .put(Authentication_1.protect, JournalController_1.updateJournalEntry)
    .delete(Authentication_1.protect, JournalController_1.deleteJournalEntry);
exports.default = router;
//# sourceMappingURL=JournalRoutes.js.map