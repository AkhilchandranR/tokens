import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/app/db/db";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";

export default function AdminProductsPage() {
    return (
        <>
            <div className="flex justify-between items-center gap-4">
                <PageHeader>Products</PageHeader>
                <Button>
                    <Link href="/admin/products/new">Add Product</Link>
                </Button>
            </div>
            <ProductsTable />
        </>
    )
}

async function ProductsTable() {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            priceInCents: true,
            _count: { select: { orders: true } },
            isAvailableForPurchase: true,
        },
        orderBy: { createdAt: "desc" },
    });

    if (products.length === 0) {
        return <div className="text-muted-foreground">No products found</div>;
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-0">
                        <span className="sr-only">Available for Purchase</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map(product => (
                    <TableRow key={product.id}>
                        <TableCell>
                            {product.isAvailableForPurchase ? (
                                <>
                                <span className="sr-only">Available</span>
                                <CheckCircle2 />
                                </>
                            ): (
                                <>
                                <span className="sr-only">Not Available</span>
                                <XCircle />
                                </>
                            )}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        {/* @ts-ignore */}
                        <TableCell>{formatCurrency(product.priceInCents) / 100}</TableCell>
                        <TableCell>{formatNumber(product._count.orders)}</TableCell>
                        <TableCell>
                            <MoreVertical />
                            <span className="sr-only">Actions</span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}