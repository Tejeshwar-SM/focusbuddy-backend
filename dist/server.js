"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./config/db"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const TaskRoutes_1 = __importDefault(require("./routes/TaskRoutes"));
const PomodoroRoutes_1 = __importDefault(require("./routes/PomodoroRoutes"));
const CalendarRoutes_1 = __importDefault(require("./routes/CalendarRoutes"));
const LeaderboardRoutes_1 = __importDefault(require("./routes/LeaderboardRoutes")); // New import
const JournalRoutes_1 = __importDefault(require("./routes/JournalRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// const PORT = process.env.PORT || 8081 // AWS EB default port;
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
    // //settings for AWS EB
    // transports: ["websocket", "polling"],
    // pingTimeout: 60000,
});
exports.io = io;
// middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// mongodb connection
(0, db_1.default)();
// default route
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.get("/api", (req, res) => {
    res.send("API is running...");
});
// Socket.IO connection handler
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
// routes
app.use("/api/auth", AuthRoutes_1.default);
app.use("/api/tasks", TaskRoutes_1.default);
app.use("/api/pomodoro", PomodoroRoutes_1.default);
app.use("/api/calendar", CalendarRoutes_1.default);
app.use("/api/leaderboard", LeaderboardRoutes_1.default); // New route
app.use("/api/journal", JournalRoutes_1.default);
// Use server.listen instead of app.listen for Socket.IO
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map