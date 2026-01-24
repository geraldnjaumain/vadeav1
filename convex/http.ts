import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

// KeshoPay/M-Pesa Webhook Handler
http.route({
    path: "/api/payments/webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();

            // Validate webhook signature (in production, verify with KeshoPay secret)
            const signature = request.headers.get("x-keshopay-signature");
            // TODO: Verify signature in production

            // Extract payment details
            const {
                transactionId,
                status,
                reference,
                amount,
                phone,
            } = body;

            if (!transactionId || !status) {
                return new Response(JSON.stringify({ error: "Missing required fields" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Process the payment callback
            await ctx.runMutation(internal.payments.processWebhook, {
                transactionId,
                status,
                reference: reference || `KP-${Date.now()}`,
            });

            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Webhook error:", error);
            return new Response(JSON.stringify({ error: "Internal server error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

export default http;
