import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActiveToggleDropdownItem, DeleteDropdownItem } from "../products/_components/ProductActions";
import { prisma } from "@/app/db/db";
import { DiscountCode } from "@/generated/prisma";

const WHERE_EXPIRED = {
    OR: [
        { limit: { not: null, lte: prisma.discountCode.fields.uses }},
        { expiresAt: { not: null, lte: new Date() }},
    ]
};

function getExpiredDiscountCodes() {
    return prisma.discountCode.findMany({
        // select: {},
        where: WHERE_EXPIRED,
        orderBy: { createdAt: "asc" },
    })
};

function getUnExpiredDiscountCodes() {
    return prisma.discountCode.findMany({
        // select: {},
        where: {NOT: WHERE_EXPIRED},
        orderBy: { createdAt: "asc" },
    })
};

export default async function DiscountCodesPage() {
    const [expiredDiscountCodes, unExpiredDiscountCodes] = await Promise.all([
        getExpiredDiscountCodes(),
        getUnExpiredDiscountCodes()
    ]);

    return (
        <>
        <div className="flex justify-between items-center gap-4">
            <PageHeader>Coupons</PageHeader>
            <Button asChild>
                <Link href="/admin/discount-codes/new">Add Coupons</Link>
            </Button>
        </div>
        <DiscountCodesTable discountCodes={unExpiredDiscountCodes} />

        <div className="mt-8">
            <h2 className="text-xl font-bold">Expired Coupons</h2>
            <DiscountCodesTable discountCodes={expiredDiscountCodes} />
        </div>
        </>
    )
};

type DiscountCodesTableProps = {
    discountCodes: Awaited<ReturnType<typeof getUnExpiredDiscountCodes>>
}

function DiscountCodesTable({ discountCodes }: DiscountCodesTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-0">
                        <span className="sr-only">Is Active</span>
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Remaining Uses</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {discountCodes.map(discountCode => (
                    <TableRow key={discountCode.id}>
                        <TableCell>
                            {discountCode.isActive ? (
                                <>
                                <span className="sr-only">Active</span>
                                <CheckCircle2 className="stroke-green-600"/>
                                </>
                            ): (
                                <>
                                <span className="sr-only">Inactive</span>
                                <XCircle className="stroke-destructive"/>
                                </>
                            )}
                        </TableCell>
                        <TableCell>{discountCode.code}</TableCell>
                        <TableCell>{formatDiscountCode(discountCode)}</TableCell>
                        <TableCell>{formatNumber(product._count.orders)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreVertical />
                                    <span className="sr-only">Actions</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem asChild>
                                        <a download href={`/admin/products/${product.id}/download`}>
                                            Download
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    {/* <ActiveToggleDropdownItem id={product.id} isAvailableForPurchase={product.isAvailableForPurchase} /> */}
                                    {/* <DeleteDropdownItem id={product.id} disabled={product._count.orders > 0} /> */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}