"use node"; // This file runs in Node.js environment

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

import { getEmailTemplate, getButton } from "./email_templates";

export const sendWelcomeEmail = internalAction({
    args: { email: v.string(), name: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[DEV] Simulator: Sending Welcome Email to ${args.email}`);
            return;
        }

        try {
            await resend.emails.send({
                from: "Vadea <onboarding@resend.dev>", // Use verified domain in prod
                to: args.email,
                subject: "Welcome to Vadea!",
                html: getEmailTemplate(`
                    <h1 style="font-family: sans-serif; font-size: 24px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welcome, ${args.name || "Student"}!</h1>
                    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">We are excited to have you join our learning community.</p>
                    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Explore our courses and start your journey today.</p>
                    ${getButton("https://vadea.app/dashboard", "Go to Dashboard")}
                `, "Welcome to Vadea"),
            });
        } catch (error) {
            console.error("Failed to send welcome email:", error);
        }
    },
});

export const sendPasswordResetEmail = internalAction({
    args: { email: v.string(), token: v.string() },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[DEV] Simulator: Reset Token for ${args.email}: ${args.token}`);
            return;
        }

        const resetLink = `${process.env.NEXT_PUBLIC_CONVEX_URL ? "http://localhost:3000" : "https://vadea.app"}/reset-password?token=${args.token}`;

        try {
            await resend.emails.send({
                from: "Vadea Security <security@resend.dev>",
                to: args.email,
                subject: "Reset your password",
                html: getEmailTemplate(`
                    <h1 style="font-family: sans-serif; font-size: 24px; font-weight: normal; margin: 0; margin-bottom: 15px;">Reset Password</h1>
                    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You requested to reset your password. Use the code below:</p>
                    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; font-family: monospace; font-size: 24px; letter-spacing: 4px; font-weight: bold; margin-bottom: 24px; text-align: center;">
                        ${args.token}
                    </div>
                    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If you didn't request this, please ignore this email.</p>
                `, "Reset Password"),
            });
        } catch (error) {
            console.error("Failed to send reset email:", error);
        }
    },
});

export const sendVerificationEmail = internalAction({
    args: { email: v.string(), token: v.string(), name: v.string() },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[DEV] Simulator: Verification Token for ${args.email}: ${args.token}`);
            return;
        }

        try {
            await resend.emails.send({
                from: "Vadea Onboarding <onboarding@resend.dev>",
                to: args.email,
                subject: "Verify your email address",
                html: getEmailTemplate(`
                     <h1 style="font-family: sans-serif; font-size: 24px; font-weight: normal; margin: 0; margin-bottom: 15px;">Verify Email</h1>
                     <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welcome ${args.name}! Please use the code below to verify your email address.</p>
                     <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; font-family: monospace; font-size: 24px; letter-spacing: 4px; font-weight: bold; margin-bottom: 24px; text-align: center;">
                        ${args.token}
                    </div>
                `, "Verify Email"),
            });
        } catch (error) {
            console.error("Failed to send verification email:", error);
        }
    },
});

export const sendPurchaseReceipt = internalAction({
    args: { email: v.string(), courseTitle: v.string(), amount: v.number() },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[DEV] Simulator: Sending Receipt for ${args.courseTitle} to ${args.email}`);
            return;
        }

        try {
            await resend.emails.send({
                from: "Vadea <billing@resend.dev>",
                to: args.email,
                subject: `Receipt for ${args.courseTitle}`,
                html: getEmailTemplate(`
                    <h1 style="font-family: sans-serif; font-size: 24px; font-weight: normal; margin: 0; margin-bottom: 15px;">Payment Successful</h1>
                    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for purchasing <strong>${args.courseTitle}</strong>.</p>
                    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Amount Paid: <strong>KES ${args.amount.toLocaleString()}</strong></p>
                    ${getButton("https://vadea.app/dashboard", "View Course")}
                `, "Purchase Receipt"),
            });
        } catch (error) {
            console.error("Failed to send receipt:", error);
        }
    },
});

export const sendCustomEmail = internalAction({
    args: { to: v.string(), subject: v.string(), body: v.string() },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[DEV] Custom Email to ${args.to}: ${args.subject}`);
            return;
        }

        try {
            await resend.emails.send({
                from: "Vadea Admin <admin@resend.dev>",
                to: args.to,
                subject: args.subject,
                html: getEmailTemplate(args.body, args.subject),
            });
        } catch (error) {
            console.error("Failed to send custom email:", error);
            throw new Error("Failed to send email");
        }
    },
});
