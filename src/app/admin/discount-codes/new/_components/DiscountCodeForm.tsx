"use client";

import { addDiscountCode } from "@/app/admin/_actions/discountCodes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DiscountCodeType } from "@/generated/prisma";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

export default function DiscountCodeForm({ products }: { products: { name: string; id: string }[] }) {
  const [error, action] = useActionState(addDiscountCode, {});
  const [allProducts, setAllProducts] = useState(true);
  //subtract timezone
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());


  return (
    <form className="space-y-8" action={action}>
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input type="text" id="code" name="code" required />
        {error.code && <div className="text-destructive">{error.code}</div>}
      </div>
      <div className="space-y-2 gap-8 flex items-baseline">
        <div className="space-y-2">
          <Label htmlFor="code">Discount type</Label>
          <RadioGroup
            id="discountType"
            name="discountType"
            defaultValue={DiscountCodeType.PERCENTAGE}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="percentage"
                value={DiscountCodeType.PERCENTAGE}
              />
              <Label htmlFor="percentage">Percentage</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="fixed" value={DiscountCodeType.FIXED} />
              <Label htmlFor="fixed">Fixed</Label>
            </div>
          </RadioGroup>
          {error.discountType && (
            <div className="text-destructive">{error.discountType}</div>
          )}
        </div>
        <div className="space-y-2 flex-grow">
          <Label htmlFor="discountAmount">Discount Amount</Label>
          <Input
            type="number"
            id="discountAmount"
            name="discountAmount"
            required
          />
          {error.discountAmount && (
            <div className="text-destructive">{error.discountAmount}</div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="limit">Limit</Label>
        <Input type="number" id="limit" name="limit" />
        <div className="text-muted-foreground">
          Leave blank for infinite uses
        </div>
        {error.limit && <div className="text-destructive">{error.limit}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expiration</Label>
        <Input
          type="datetime-local"
          id="expiresAt"
          name="expiresAt"
          min={today.toJSON().split(":").slice(0, -1).join(":")}
        />
        <div className="text-muted-foreground">
          Leave blank for no expiration
        </div>
        {error.expiresAt && (
          <div className="text-destructive">{error.expiresAt}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label>Allowed Products</Label>
        {error.allProducts && <div className="text-destructive">{error.allProducts}</div>}
        {error.productIds && <div className="text-destructive">{error.productIds}</div>}
        <div className="flex gap-2 items-center">
            <Checkbox id="allProducts" name="allProducts" checked={allProducts} onCheckedChange={e => setAllProducts(e === true)} />
            <Label htmlFor="allProducts">All Products</Label>
        </div>
        { products.map(product => (
            <div className="flex gap-2 items-center">
              <Checkbox id={product.id} name="productIds" value={product.id} disabled={allProducts}/>
              <Label htmlFor={product.id}>{product.name}</Label>
            </div>
        ))}
      </div>
      {SubmitButton()}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
