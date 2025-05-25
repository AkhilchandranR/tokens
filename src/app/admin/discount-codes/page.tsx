import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Globe, Infinity, Minus, MoreVertical, XCircle } from "lucide-react";
import { formatDateTime, formatDiscountCode, formatNumber } from "@/lib/formatters";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { prisma } from "@/app/db/db";
import { DiscountCode, Prisma } from "@/generated/prisma";
import { ActiveToggleDropdownItem, DeleteDropdownItem } from "./new/_components/DiscountCodeActions";

const WHERE_EXPIRED = {
    OR: [
        { limit: { not: null, lte: prisma.discountCode.fields.uses }},
        { expiresAt: { not: null, lte: new Date() }},
    ]
};

const SELECT_FIELDS: Prisma.DiscountCodeSelect = {
    id: true,
    allProducts: true,
    code: true,
    discountAmount: true,
    discountType: true,
    expiresAt: true,
    limit: true,
    uses: true,
    isActive: true,
    products: { select: { name: true }},
    _count: { select: { orders: true }}
}

function getExpiredDiscountCodes() {
    return prisma.discountCode.findMany({
        select: SELECT_FIELDS,
        where: WHERE_EXPIRED,
        orderBy: { createdAt: "asc" },
    })
};

function getUnExpiredDiscountCodes() {
    return prisma.discountCode.findMany({
        select: SELECT_FIELDS,
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
        <DiscountCodesTable discountCodes={unExpiredDiscountCodes} canDecactivate />

        <div className="mt-8">
            <h2 className="text-xl font-bold">Expired Coupons</h2>
            <DiscountCodesTable discountCodes={expiredDiscountCodes} isInactive />
        </div>
        </>
    )
};

type DiscountCodesTableProps = {
    discountCodes: Awaited<ReturnType<typeof getUnExpiredDiscountCodes>>
    isInactive?: boolean;
    canDecactivate?: boolean;
}

function DiscountCodesTable({ 
    discountCodes,
    isInactive = false,
    canDecactivate = false
 }: DiscountCodesTableProps) {
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
                            {discountCode.isActive && !isInactive ? (
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
                        <TableCell>{discountCode.expiresAt == null ? (
                            <Minus />
                        ): (
                            formatDateTime(discountCode.expiresAt)
                        )
                        }</TableCell>
                        <TableCell>{discountCode.limit == null ? (
                            <Infinity />
                        ): (
                            formatNumber(discountCode.limit - discountCode.uses)
                        )
                        }</TableCell>
                        <TableCell>
                            {formatNumber(discountCode._count.orders)}
                        </TableCell>
                        <TableCell>
                            {discountCode.allProducts ? (
                                <Globe />
                            ): (
                                discountCode.products.map(p => p.name).join(", ")
                            )}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreVertical />
                                    <span className="sr-only">Actions</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    { canDecactivate && (
                                        <ActiveToggleDropdownItem 
                                            id={discountCode.id} 
                                            isActive={discountCode.isActive} 
                                        />
                                    )}
                                    <DeleteDropdownItem 
                                        id={discountCode.id} 
                                        disabled={discountCode._count.orders > 0} 
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}