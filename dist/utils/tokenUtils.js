"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.verifyRefreshToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Ensure environment variables are loaded
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!ACCESS_SECRET || !REFRESH_SECRET) {
    console.error("JWT secrets not found in environment variables!");
}
//access token- short lived
const generateAccessToken = (userId) => {
    if (!ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ id: userId }, ACCESS_SECRET, {
        expiresIn: "15m",
    });
};
exports.generateAccessToken = generateAccessToken;
//refresh token- long lived
const generateRefreshToken = (userId) => {
    if (!REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ id: userId }, REFRESH_SECRET, {
        expiresIn: "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        if (!REFRESH_SECRET) {
            console.error("JWT_REFRESH_SECRET is not defined in environment variables");
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
        return decoded;
    }
    catch (error) {
        console.error("Refresh token verification failed:", error);
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
// Verify access token (useful for utility functions)
const verifyAccessToken = (token) => {
    try {
        if (!ACCESS_SECRET) {
            console.error("JWT_ACCESS_SECRET is not defined in environment variables");
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
//# sourceMappingURL=tokenUtils.js.map