import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate upload URL for files
export const generateUploadUrl = mutation(async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
        throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
});

// Store file metadata after upload
export const saveFileMetadata = mutation({
    args: {
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number()
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Get the file URL
        const url = await ctx.storage.getUrl(args.storageId);

        return {
            storageId: args.storageId,
            fileName: args.fileName,
            fileType: args.fileType,
            fileSize: args.fileSize,
            url: url || "",
            uploadedBy: userId,
            uploadedAt: Date.now()
        };
    }
});

// Get file URL from storage ID
export const getFileUrl = mutation({
    args: {
        storageId: v.id("_storage")
    },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    }
});

// Delete file from storage
export const deleteFile = mutation({
    args: {
        storageId: v.id("_storage")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        await ctx.storage.delete(args.storageId);
    }
});
