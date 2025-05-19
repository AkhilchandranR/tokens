import { prisma } from "@/app/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resent = new Resend(process.env.RESENT_API_KEY as string);

export async function POST(req: NextRequest) {
    const event = await stripe.webhooks.constructEvent(
        await req.text(),
        req.headers.get("Stripe-Signature") as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "charge.succeeded") {
        const charge = event.data.object;
        const productId = charge.metadata.productId;
        const email = charge.billing_details.email;
        const pricePaidInCents = charge.amount;

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if(product == null || email == null) {
            return new NextResponse("Bad request", { status: 400 });
        }

        const userFields = {
            email,
            orders: { create: { productId, pricePaidInCents } }
        };

        await prisma.user.upsert({
            where: { email },
            create: userFields,
            update: userFields,
            select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } }
        })

        const downloadVerification = await prisma.downloadVerification.create({
            data: {
                productId,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            }
        });

        await resent.emails.send({
            from: `Support <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: `Your purchase of ${product.name}`,
            react: <h1>HI</h1>,
        })
    }

    return new NextResponse("OK", { status: 200 });
}