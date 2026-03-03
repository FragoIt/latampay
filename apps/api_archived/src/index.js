"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var env_1 = require("./config/env");
var invoices_1 = require("./routes/invoices");
var app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/invoices', invoices_1.default);
app.get('/health', function (req, res) {
    res.json({
        status: 'ok',
        service: 'latampay-api',
        environment: env_1.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
app.listen(env_1.env.PORT, function () {
    console.log("\uD83D\uDE80 LatamPay API running on port ".concat(env_1.env.PORT));
    console.log("\uD83D\uDCDD Environment: ".concat(env_1.env.NODE_ENV));
    if (env_1.isDevelopment) {
        console.log("\uD83D\uDD17 Frontend URL: ".concat(env_1.env.FRONTEND_URL));
    }
});
