import { prisma } from "@/app/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import CheckoutForm from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


export default async function PurchasePage({ params }: { params: { id: string } }) {
    const { id } = await params; 
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if(product == null) return notFound();

    const paymentIntend = await stripe.paymentIntents.create({
        amount: product.priceInCents,
        currency: "USD",
        metadata: { productId: product.id }
    });

    if(paymentIntend.client_secret == null) {
        throw Error("Stripe failed to create payment intend");
    }
    
    return (
        <CheckoutForm product={product} clientSecret={paymentIntend.client_secret} />
    )
}