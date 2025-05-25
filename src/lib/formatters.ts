import { DiscountCodeType } from "@/generated/prisma";

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
});

export function formatCurrency(value: number) {
    return currencyFormatter.format(value);
};

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatNumber(value: number) {
    return NUMBER_FORMATTER.format(value);
};

const PERCENT_FORMATTER = new Intl.NumberFormat("en-US", { style: "percent" })

export function formatDiscountCode({
  discountAmount,
  discountType,
}: {
  discountAmount: number
  discountType: DiscountCodeType
}) {
  switch (discountType) {
    case "PERCENTAGE":
      return PERCENT_FORMATTER.format(discountAmount / 100)
    case "FIXED":
      return formatCurrency(discountAmount)
    default:
      throw new Error(
        `Invalid discount code type ${discountType satisfies never}`
      )
  }
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatDateTime(date: Date) {
  return DATE_TIME_FORMATTER.format(date)
}