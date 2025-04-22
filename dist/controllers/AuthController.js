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
exports.logout = exports.refreshAccessToken = exports.getCurrentUser = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const tokenUtils_1 = require("../utils/tokenUtils");
//register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        //check if user already exists
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ success: false, message: "User already exists" });
            return;
        }
        //create a new user
        const user = new User_1.default({ name, email, password });
        //generate tokens
        const accessToken = (0, tokenUtils_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, tokenUtils_1.generateRefreshToken)(user._id.toString());
        //set refresh token in http only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        });
        //save refresh token in database
        user.refreshToken = refreshToken;
        yield user.save();
        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                accessToken,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.register = register;
//login a user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = (yield User_1.default.findOne({ email }));
        if (!user) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        if (user && (yield user.comparePassword(password))) {
            //update last active
            user.lastActive = new Date();
            //generate tokens
            const accessToken = (0, tokenUtils_1.generateAccessToken)(user._id.toString());
            const refreshToken = (0, tokenUtils_1.generateRefreshToken)(user._id.toString());
            //save refesh token in database
            user.refreshToken = refreshToken;
            yield user.save();
            //set refresh token in http only cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            });
            res.json({
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    accessToken,
                },
            });
        }
        else {
            res.status(400).json({ success: false, message: "Invalid credentials" });
        }
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.login = login;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // req.user is set by your auth middleware
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select("-password -refreshToken");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getCurrentUser = getCurrentUser;
//refresh access token
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: "No refresh token provided",
                expired: true
            });
            return;
        }
        try {
            //verify refresh token
            const decoded = (0, tokenUtils_1.verifyRefreshToken)(refreshToken);
            if (!decoded) {
                res.status(401).json({
                    success: false,
                    message: "Invalid refresh token",
                    expired: true
                });
                return;
            }
            //check if user exists and token is valid
            const user = yield User_1.default.findById(decoded.id);
            if (!user || user.refreshToken !== refreshToken) {
                res.status(401).json({
                    success: false,
                    message: "Invalid refresh token or user not found",
                    expired: true
                });
                return;
            }
            //generate new access token
            const accessToken = (0, tokenUtils_1.generateAccessToken)(user._id.toString());
            // Success response
            res.json({
                success: true,
                data: {
                    accessToken,
                },
            });
        }
        catch (tokenError) {
            console.error("Token verification error:", tokenError);
            res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
                expired: true
            });
        }
    }
    catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
exports.refreshAccessToken = refreshAccessToken;
//logout a user
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            //find user with this refresh token and clear it
            yield User_1.default.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        }
        //clear the cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/"
        });
        res.json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.logout = logout;
//# sourceMappingURL=AuthController.js.map