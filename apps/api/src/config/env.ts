import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local (development) or .env (production)
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

// Also load .env as fallback
dotenv.config();

/**
 * Environment variables schema using Zod for runtime validation
 * This ensures type safety and validates all required environment variables
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  DATABASE_POOL_SIZE: z
    .string()
    .regex(/^\d+$/, 'DATABASE_POOL_SIZE must be a positive number')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),

  // Blockchain
  POLYGON_RPC_URL: z.string().url('POLYGON_RPC_URL must be a valid URL'),
  POLYGON_MUMBAI_RPC_URL: z.string().url('POLYGON_MUMBAI_RPC_URL must be a valid URL'),
  PRIVATE_KEY_DEPLOYER: z
    .string()
    .regex(/^(0x)?[0-9a-fA-F]{64}$/, 'PRIVATE_KEY_DEPLOYER must be a valid 64-character hex string (with or without 0x prefix)')
    .transform((val) => val.startsWith('0x') ? val.slice(2) : val),
  CONTRACT_ADDRESS_GATEWAY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'CONTRACT_ADDRESS_GATEWAY must be a valid Ethereum address'),
  CONTRACT_ADDRESS_USDC: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'CONTRACT_ADDRESS_USDC must be a valid Ethereum address'),
  CONTRACT_ADDRESS_USDT: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'CONTRACT_ADDRESS_USDT must be a valid Ethereum address'),

  // Auth
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  // Payments
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),

  // External APIs
  ALCHEMY_API_KEY: z.string().min(1, 'ALCHEMY_API_KEY is required'),
  COINGECKO_API_KEY: z.string().min(1, 'COINGECKO_API_KEY is required'),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    errorMap: () => ({
      message: 'NODE_ENV must be one of: development, production, test',
    }),
  }),
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(65535)),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
});

/**
 * Validated environment variables
 * This object contains all environment variables with proper types
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates and parses environment variables
 * Throws an error if any required variable is missing or invalid
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
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
export const env = validateEnv();

/**
 * Helper to check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Helper to check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Helper to check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test';

