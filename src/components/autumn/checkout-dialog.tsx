"use client";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCheckoutContent } from "@/lib/autumn/checkout-content";
import { useCustomer } from "autumn-js/react";
import { ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import type { CheckoutResult, ProductItem } from "autumn-js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface CheckoutDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  checkoutResult: CheckoutResult;
}

const formatCurrency = ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export default function CheckoutDialog(params: CheckoutDialogProps) {
  const { attach } = useCustomer();
  const [checkoutResult, setCheckoutResult] = useState<
    CheckoutResult | undefined
  >(params?.checkoutResult);

  useEffect(() => {
    if (params.checkoutResult) {
      setCheckoutResult(params.checkoutResult);
    }
  }, [params.checkoutResult]);

  const [loading, setLoading] = useState(false);

  if (!checkoutResult) {
    return <></>;
  }

  const { open, setOpen } = params;
  const { title, message } = getCheckoutContent(checkoutResult);

  const isFree = checkoutResult?.product.properties?.is_free;
  const isPaid = isFree === false;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 p-0 pt-4 overflow-hidden text-foreground text-sm">
        <DialogTitle className="mb-1 px-6">{title}</DialogTitle>
        <div className="mt-1 mb-4 px-6 text-muted-foreground">
          {message}
        </div>

        {isPaid && checkoutResult && (
          <PriceInformation
            checkoutResult={checkoutResult}
            setCheckoutResult={setCheckoutResult}
          />
        )}

        <DialogFooter className="flex sm:flex-row flex-col justify-between gap-x-4 bg-secondary shadow-inner py-2 pr-3 pl-6 border-t">
          <Button
            size="sm"
            onClick={async () => {
              setLoading(true);

              const options = checkoutResult.options.map((option) => {
                return {
                  featureId: option.feature_id,
                  quantity: option.quantity,
                };
              });

              await attach({
                productId: checkoutResult.product.id,
                options,
              });
              setOpen(false);
              setLoading(false);
            }}
            disabled={loading}
            className="flex items-center gap-2 min-w-16"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="flex gap-1 whitespace-nowrap">
                  Confirm
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PriceInformation({
  checkoutResult,
  setCheckoutResult,
}: {
  checkoutResult: CheckoutResult;
  setCheckoutResult: (checkoutResult: CheckoutResult) => void;
}) {
  return (
    <div className="flex flex-col gap-4 mb-4 px-6">
      <ProductItems
        checkoutResult={checkoutResult}
        setCheckoutResult={setCheckoutResult}
      />

      <div className="flex flex-col gap-2">
        {checkoutResult?.has_prorations && checkoutResult.lines.length > 0 && (
          <CheckoutLines checkoutResult={checkoutResult} />
        )}
        <DueAmounts checkoutResult={checkoutResult} />
      </div>
    </div>
  );
}

function DueAmounts({ checkoutResult }: { checkoutResult: CheckoutResult }) {
  const { next_cycle, product } = checkoutResult;
  const nextCycleAtStr = next_cycle
    ? new Date(next_cycle.starts_at).toLocaleDateString()
    : undefined;

  const hasUsagePrice = product.items.some(
    (item) => item.usage_model === "pay_per_use"
  );

  const showNextCycle = next_cycle && next_cycle.total !== checkoutResult.total;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <div>
          <p className="font-medium text-md">Total due today</p>
        </div>

        <p className="font-medium text-md">
          {formatCurrency({
            amount: checkoutResult?.total,
            currency: checkoutResult?.currency,
          })}
        </p>
      </div>
      {showNextCycle && (
        <div className="flex justify-between text-muted-foreground">
          <div>
            <p className="text-md">Due next cycle ({nextCycleAtStr})</p>
          </div>
          <p className="text-md">
            {formatCurrency({
              amount: next_cycle.total,
              currency: checkoutResult?.currency,
            })}
            {hasUsagePrice && <span> + usage prices</span>}
          </p>
        </div>
      )}
    </div>
  );
}

function ProductItems({
  checkoutResult,
  setCheckoutResult,
}: {
  checkoutResult: CheckoutResult;
  setCheckoutResult: (checkoutResult: CheckoutResult) => void;
}) {
  const isUpdateQuantity =
    checkoutResult?.product.scenario === "active" &&
    checkoutResult.product.properties.updateable;
  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-sm">Price</p>
      {checkoutResult?.product.items
        .filter((item) => item.type !== "feature")
        .map((item, index) => {
          if (item.usage_model == "prepaid") {
            return (
              <PrepaidItem
                key={index}
                item={item}
                checkoutResult={checkoutResult!}
                setCheckoutResult={setCheckoutResult}
              />
            );
          }

          if (isUpdateQuantity) {
            return null;
          }

          return (
            <div key={index} className="flex justify-between">
              <p className="text-muted-foreground">
                {item.feature ? item.feature.name : "Subscription"}
              </p>
              <p>
                {item.display?.primary_text} {item.display?.secondary_text}
              </p>
            </div>
          );
        })}
    </div>
  );
}

function CheckoutLines({ checkoutResult }: { checkoutResult: CheckoutResult }) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="total" className="border-b-0">
        <CustomAccordionTrigger className="justify-between my-0 py-0 border-none w-full">
          <div className="flex justify-end items-center gap-1 w-full cursor-pointer">
            <p className="font-light text-muted-foreground">
              View details
            </p>
            <ChevronDown
              className="mt-0.5 text-muted-foreground rotate-90 transition-transform duration-200 ease-in-out"
              size={14}
            />
          </div>
        </CustomAccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 mt-2 mb-0 pb-2">
          {checkoutResult?.lines
            .filter((line) => line.amount != 0)
            .map((line, index) => {
              return (
                <div key={index} className="flex justify-between">
                  <p className="text-muted-foreground">{line.description}</p>
                  <p className="text-muted-foreground">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: checkoutResult?.currency,
                    }).format(line.amount)}
                  </p>
                </div>
              );
            })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function CustomAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 justify-between items-start gap-4 disabled:opacity-50 py-4 focus-visible:border-ring rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 font-medium text-sm text-left [&[data-state=open]_svg]:rotate-0 transition-all disabled:pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

const PrepaidItem = ({
  item,
  checkoutResult,
  setCheckoutResult,
}: {
  item: ProductItem;
  checkoutResult: CheckoutResult;
  setCheckoutResult: (checkoutResult: CheckoutResult) => void;
}) => {
  const { quantity = 0, billing_units: billingUnits = 1 } = item;
  const [quantityInput, setQuantityInput] = useState<string>(
    (quantity / billingUnits).toString()
  );
  const { checkout } = useCustomer();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const scenario = checkoutResult.product.scenario;

  const handleSave = async () => {
    setLoading(true);
    try {
      const newOptions = checkoutResult.options
        .filter((option) => option.feature_id !== item.feature_id)
        .map((option) => {
          return {
            featureId: option.feature_id,
            quantity: option.quantity,
          };
        });

      newOptions.push({
        featureId: item.feature_id!,
        quantity: Number(quantityInput) * billingUnits,
      });

      const { data, error } = await checkout({
        productId: checkoutResult.product.id,
        options: newOptions,
        successUrl: "/dashboard",
      });

      if (error) {
        console.error(error);
        return;
      }
      setCheckoutResult(data!);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const disableSelection = scenario === "renew";

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <p className="text-muted-foreground">{item.feature?.name}</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              "flex items-center gap-1 bg-accent/80 px-1 py-0.5 rounded-md text-muted-foreground text-xs",
              disableSelection !== true &&
                "hover:bg-accent hover:text-foreground"
            )}
            disabled={disableSelection}
          >
            Qty: {quantity}
            <ChevronDown size={12} />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex flex-col gap-4 p-4 pt-3 w-80 text-sm"
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">{item.feature?.name}</p>
              <p className="text-muted-foreground">
                {item.display?.primary_text} {item.display?.secondary_text}
              </p>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <Input
                  className="focus:!ring-2 w-16 h-7"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                />
                <p className="text-muted-foreground">
                  {billingUnits > 1 && `x ${billingUnits} `}
                  {item.feature?.name}
                </p>
              </div>

              <Button
                onClick={handleSave}
                className="items-center bg-white hover:bg-zinc-100 shadow-sm border border-zinc-200 w-14 !h-7 text-foreground text-sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="!w-4 !h-4 text-muted-foreground animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p>
        {item.display?.primary_text} {item.display?.secondary_text}
      </p>
    </div>
  );
};

export const PriceItem = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex sm:flex-row flex-col justify-between sm:items-center gap-1 sm:gap-2 pb-4 sm:pb-0 sm:h-7",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const PricingDialogButton = ({
  children,
  size,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "lg" | "default" | "icon";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      className={cn(className, "shadow-sm shadow-stone-400")}
    >
      {children}
      <ArrowRight className="!h-3" />
    </Button>
  );
};
