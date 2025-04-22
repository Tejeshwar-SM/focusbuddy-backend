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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Protect routes - middleware to check if user is authenticated
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        // Check for token in Authorization header
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            // Get token from header - format "Bearer <token>"
            token = req.headers.authorization.split(" ")[1];
        }
        // Check if token exists
        if (!token) {
            res
                .status(401)
                .json({
                success: false,
                message: "Not authorized, no token",
                expired: true
            });
            return;
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            // Check if user exists
            const user = yield User_1.default.findById(decoded.id).select("-password");
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "User not found",
                    expired: true
                });
                return;
            }
            // Add user to request
            req.user = { id: decoded.id };
            next();
        }
        catch (error) {
            console.error("Token verification error:", error.message);
            // Send clearer error message based on error type
            if (error.name === "TokenExpiredError") {
                res.status(401).json({
                    success: false,
                    message: "Token expired, please login again",
                    expired: true
                });
            }
            else if (error.name === "JsonWebTokenError") {
                res.status(401).json({
                    success: false,
                    message: "Invalid token format",
                    expired: true
                });
            }
            else {
                res.status(401).json({
                    success: false,
                    message: "Not authorized, token verification failed",
                    expired: true
                });
            }
            return;
        }
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.protect = protect;
//# sourceMappingURL=Authentication.js.map