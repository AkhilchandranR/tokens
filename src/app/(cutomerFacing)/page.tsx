import { Product } from "@/generated/prisma";
import { prisma } from "../db/db"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Suspense } from "react";

function getMostPopularProducts() {
    return prisma.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { orders: { _count: "desc" }},
        take: 6
    });
};

function getNewestProducts() {
    return prisma.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { createdAt: "desc" },
        take: 6
    });
};

export default function HomePage() {
    return (
        <main className="space-y-12">
            <ProductGridSsection title="Most Popular" productFetcher={getMostPopularProducts}/>
            <ProductGridSsection title="Newest" productFetcher={getNewestProducts}/>
        </main>
    )
};

type ProductGridSsectionProps = {
    title: string;
    productFetcher: () => Promise<Product[]>
}

function ProductGridSsection({ productFetcher, title }: ProductGridSsectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold">{title}</h2>
                <Button asChild>
                    <Link href='/products' className="space-x-2">
                        <span>View All</span>
                        <ArrowRight className="size-4"/>
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Suspense fallback={
                    <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    </>
                }>
                    <ProductSuspense productFetcher={productFetcher} />
                </Suspense>
            </div> 
        </div>
    )
}

async function ProductSuspense({productFetcher}: {productFetcher: () => Promise<Product[]>}) {
    return (
            (await productFetcher()).map((product) => (
                    <ProductCard 
                        key={product.id}
                        {...product} 
                    />
            ))
    )
};