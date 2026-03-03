"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.env = void 0;
var zod_1 = require("zod");
var dotenv_1 = require("dotenv");
var path_1 = require("path");
// Load environment variables from .env.local (development) or .env (production)
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), '.env.local'),
});
// Also load .env as fallback
dotenv_1.default.config();
/**
 * Environment variables schema using Zod for runtime validation
 * This ensures type safety and validates all required environment variables
 */
var envSchema = zod_1.z.object({
    // Database
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
    DATABASE_POOL_SIZE: zod_1.z
        .string()
        .regex(/^\d+$/, 'DATABASE_POOL_SIZE must be a positive number')
        .transform(function (val) { return parseInt(val, 10); })
        .pipe(zod_1.z.number().int().positive().max(100)),
    // Blockchain
    POLYGON_RPC_URL: zod_1.z.string().url('POLYGON_RPC_URL must be a valid URL'),
    POLYGON_MUMBAI_RPC_URL: zod_1.z.string().url('POLYGON_MUMBAI_RPC_URL must be a valid URL'),
    PRIVATE_KEY_DEPLOYER: zod_1.z
        .string()
        .regex(/^(0x)?[0-9a-fA-F]{64}$/, 'PRIVATE_KEY_DEPLOYER must be a valid 64-character hex string (with or without 0x prefix)')
        .transform(function (val) { return val.startsWith('0x') ? val.slice(2) : val; }),
    CONTRACT_ADDRESS_GATEWAY: zod_1.z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'CONTRACT_ADDRESS_GATEWAY must be a valid Ethereum address'),
    CONTRACT_ADDRESS_USDC: zod_1.z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'CONTRACT_ADDRESS_USDC must be a valid Ethereum address'),
    CONTRACT_ADDRESS_USDT: zod_1.z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'CONTRACT_ADDRESS_USDT must be a valid Ethereum address'),
    // Auth
    SUPABASE_URL: zod_1.z.string().url('SUPABASE_URL must be a valid URL'),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1, 'SUPABASE_ANON_KEY is required'),
    SUPABASE_SERVICE_KEY: zod_1.z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
    JWT_SECRET: zod_1.z
        .string()
        .min(32, 'JWT_SECRET must be at least 32 characters for security'),
    // Payments
    STRIPE_SECRET_KEY: zod_1.z
        .string()
        .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
    STRIPE_WEBHOOK_SECRET: zod_1.z
        .string()
        .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
    // External APIs
    ALCHEMY_API_KEY: zod_1.z.string().min(1, 'ALCHEMY_API_KEY is required'),
    COINGECKO_API_KEY: zod_1.z.string().min(1, 'COINGECKO_API_KEY is required'),
    // App
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test'], {
        errorMap: function () { return ({
            message: 'NODE_ENV must be one of: development, production, test',
        }); },
    }),
    PORT: zod_1.z
        .string()
        .regex(/^\d+$/, 'PORT must be a number')
        .transform(function (val) { return parseInt(val, 10); })
        .pipe(zod_1.z.number().int().positive().max(65535)),
    FRONTEND_URL: zod_1.z.string().url('FRONTEND_URL must be a valid URL'),
});
/**
 * Validates and parses environment variables
 * Throws an error if any required variable is missing or invalid
 */
function validateEnv() {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            var missingVars = error.errors.map(function (err) {
                var path = err.path.join('.');
                return "  - ".concat(path, ": ").concat(err.message);
            });
            console.error('❌ Environment variable validation failed!\n');
            console.error('Missing or invalid environment variables:');
            console.error(missingVars.join('\n'));
            console.error('\n💡 Please check your .env.local file and ensure all required variables are set.');
            console.error('💡 You can copy .env.example to .env.local as a starting point.\n');
            process.exit(1);
        }
        throw error;
    }
}
/**
 * Validated environment configuration
 * Access environment variables through this object for type safety
 */
exports.env = validateEnv();
/**
 * Helper to check if we're in development mode
 */
exports.isDevelopment = exports.env.NODE_ENV === 'development';
/**
 * Helper to check if we're in production mode
 */
exports.isProduction = exports.env.NODE_ENV === 'production';
/**
 * Helper to check if we're in test mode
 */
exports.isTest = exports.env.NODE_ENV === 'test';
