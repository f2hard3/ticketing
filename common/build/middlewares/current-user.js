"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUser = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const currentUser = (req, _, next) => {
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt))
        return next();
    try {
        const payload = (0, jsonwebtoken_1.verify)(req.session.jwt, process.env.JWT_KEY);
        req.currentUser = payload;
    }
    catch (err) {
    }
    next();
};
exports.currentUser = currentUser;
