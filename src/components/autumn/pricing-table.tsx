"use client";

import React from "react";

import { useCustomer, usePricingTable } from "autumn-js/react";
import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import CheckoutDialog from "@/components/autumn/checkout-dialog";
import { getPricingTableContent } from "@/lib/autumn/pricing-table-content";
import type { Product, ProductItem } from "autumn-js";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";



export default function PricingTable({
  productDetails,
  redirectTo,
  showBackToDashboard = false,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productDetails?: any[];
  redirectTo?: string;
  showBackToDashboard?: boolean;
}) {
  // Always call useTranslations hook (rules of hooks)
  const t = useTranslations("pricing.table");
  const { checkout } = useCustomer();
  const [isAnnual, setIsAnnual] = useState(false);
  const { products, isLoading, error } = usePricingTable({ productDetails });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-full min-h-[300px]">
        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    );
  }

  if (error) {
    return <div>{t("error")}</div>;
  }

  const intervals = Array.from(
    new Set(
      products?.map((p) => p.properties?.interval_group).filter((i) => !!i)
    )
  );

  const multiInterval = intervals.length > 1;

  const intervalFilter = (product: Product) => {
    if (!product.properties?.interval_group) {
      return true;
    }

    if (multiInterval) {
      if (isAnnual) {
        return product.properties?.interval_group === "year";
      } else {
        return product.properties?.interval_group === "month";
      }
    }

    return true;
  };

  return (
    <div className={cn("root")}>
      {products && (
        <PricingTableContainer
          products={products}
          isAnnualToggle={isAnnual}
          setIsAnnualToggle={setIsAnnual}
          multiInterval={multiInterval}
          productDetails={productDetails}
        >
          {products.filter(intervalFilter).map((product, index) => (
            <PricingCard
              key={index}
              productId={product.id}
              buttonProps={{
                disabled:
                  (product.scenario === "active" &&
                    !product.properties.updateable) ||
                  product.scenario === "scheduled",

                onClick: async () => {
                  if (product.id) {
                    await checkout({
                      productId: product.id,
                      dialog: CheckoutDialog, 
                      successUrl: redirectTo
                    });
                  } else if (product.display?.button_url) {
                    window.open(product.display?.button_url, "_blank");
                  }
                },
              }}
            />
          ))}
          {products.some(p => p.scenario === "active") && redirectTo && showBackToDashboard && (
            <div className="col-span-full mt-6 text-center">
              <Button variant="link" asChild>
                <a href={redirectTo}>Dashboard →</a>
              </Button>
            </div>
          )}
        </PricingTableContainer>
      )}
    </div>
  );
}

const PricingTableContext = createContext<{
  isAnnualToggle: boolean;
  setIsAnnualToggle: (isAnnual: boolean) => void;
  products: Product[];
  showFeatures: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productDetails?: any[];
}>({
  isAnnualToggle: false,
  setIsAnnualToggle: () => {},
  products: [],
  showFeatures: true,
  productDetails: [],
});

export const usePricingTableContext = (componentName: string) => {
  const context = useContext(PricingTableContext);

  if (context === undefined) {
    throw new Error(`${componentName} must be used within <PricingTable />`);
  }

  return context;
};

export const PricingTableContainer = ({
  children,
  products,
  showFeatures = true,
  className,
  isAnnualToggle,
  setIsAnnualToggle,
  multiInterval,
  productDetails,
}: {
  children?: React.ReactNode;
  products?: Product[];
  showFeatures?: boolean;
  className?: string;
  isAnnualToggle: boolean;
  setIsAnnualToggle: (isAnnual: boolean) => void;
  multiInterval: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productDetails?: any[];
}) => {
  if (!products) {
    throw new Error("products is required in <PricingTable />");
  }

  if (products.length === 0) {
    return <></>;
  }

  const hasRecommended = products?.some((p) => p.display?.recommend_text);
  return (
    <PricingTableContext.Provider
      value={{ isAnnualToggle, setIsAnnualToggle, products, showFeatures, productDetails }}
    >
      <div
        className={cn(
          "flex flex-col items-center",
          hasRecommended && "!py-10"
        )}
      >
        {multiInterval && (
          <div
            className={cn(
              products.some((p) => p.display?.recommend_text) && "mb-8"
            )}
          >
            <AnnualSwitch
              isAnnualToggle={isAnnualToggle}
              setIsAnnualToggle={setIsAnnualToggle}
            />
          </div>
        )}
        <div
          className={cn(
            "gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mx-auto w-full max-w-6xl",
            className
          )}
        >
          {children}
        </div>
      </div>
    </PricingTableContext.Provider>
  );
};

interface PricingCardProps {
  productId: string;
  showFeatures?: boolean;
  className?: string;
  onButtonClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  buttonProps?: React.ComponentProps<"button">;
}

export const PricingCard = ({
  productId,
  className,
  buttonProps,
}: PricingCardProps) => {
  const t = useTranslations("pricing");
  const tButtons = useTranslations("pricing.buttons");
  const { products, showFeatures, productDetails } = usePricingTableContext("PricingCard");

  const product = products.find((p) => p.id === productId);

  if (!product) {
    throw new Error(`Product with id ${productId} not found`);
  }

  const { name, display: productDisplay } = product;

  const { buttonText } = getPricingTableContent(product);

  const isRecommended = productDisplay?.recommend_text ? true : false;
  
  // Helper function to get translated text
  const getTranslatedText = (text: string | undefined) => {
    if (text && text.startsWith('pricing.')) {
      try {
        // Remove the 'pricing.' prefix to get the correct key
        const key = text.replace('pricing.', '');
        return t(key);
      } catch {
        // If translation fails, return the original text
        return text || '';
      }
    }
    return text || '';
  };

  // Get our custom product details to override Autumn.js data
  const customProductDetails = productDetails?.find(p => p.id === product.id);
  
  // Merge custom content with Autumn.js data
  const mergedItems = product.items.map((item, index) => {
    if (customProductDetails && customProductDetails.items[index]) {
      return {
        ...item,
        display: {
          ...item.display,
          primary_text: customProductDetails.items[index].display?.primary_text || item.display?.primary_text,
          secondary_text: customProductDetails.items[index].display?.secondary_text || item.display?.secondary_text,
        }
      };
    }
    return item;
  });

  const mainPriceDisplay = product.properties?.is_free
    ? {
        primary_text: t("plans.free.name"),
      }
    : {
        primary_text: getTranslatedText(mergedItems[0].display?.primary_text),
        secondary_text: getTranslatedText(mergedItems[0].display?.secondary_text),
      };

  const featureItems = product.properties?.is_free
    ? mergedItems
    : mergedItems.slice(1);

  console.log('mergedItems', mergedItems);
  console.log('featureItems', featureItems);

  // Get translated text for button
  const getButtonText = () => {
    if (productDisplay?.button_text) {
      return t(productDisplay.button_text);
    }
    if (typeof buttonText === 'string') {
      return tButtons(buttonText.replace('pricing.buttons.', ''));
    }
    return buttonText;
  };

  // Get translated text for product name and description
  const getProductName = () => {
    if (productDisplay?.name && productDisplay.name.startsWith('pricing.')) {
      return t(productDisplay.name);
    }
    return productDisplay?.name || name;
  };

  const getProductDescription = () => {
    if (productDisplay?.description && productDisplay.description.startsWith('pricing.')) {
      return t(productDisplay.description);
    }
    return productDisplay?.description;
  };

  // Get translated text for recommend text
  const getRecommendText = () => {
    if (productDisplay?.recommend_text && productDisplay.recommend_text.startsWith('pricing.')) {
      return t(productDisplay.recommend_text);
    }
    return productDisplay?.recommend_text;
  };

  return (
    <div
      className={cn(
        "shadow-sm py-6 border rounded-lg w-full max-w-xl h-full text-foreground",
        isRecommended &&
          "lg:-translate-y-6 lg:shadow-lg dark:shadow-zinc-800/80 lg:h-[calc(100%+48px)] bg-secondary/40",
        className
      )}
    >
      {productDisplay?.recommend_text && (
        <RecommendedBadge recommended={getRecommendText() || ''} />
      )}
      <div
        className={cn(
          "flex flex-col flex-grow h-full",
          isRecommended && "lg:translate-y-6"
        )}
      >
        <div className="h-full">
          <div className="flex flex-col">
            <div className="pb-4">
              <h2 className="px-6 font-semibold text-2xl truncate">
                {getProductName()}
              </h2>
              {productDisplay?.description && (
                <div className="px-6 h-8 text-muted-foreground text-sm">
                  <p className="line-clamp-2">
                    {getProductDescription()}
                  </p>
                </div>
              )}
            </div>
            <div className="mb-2">
              <h3 className="flex items-center bg-secondary/40 mb-4 px-6 border-y h-16 font-semibold">
                <div className="line-clamp-2">
                  {mainPriceDisplay?.primary_text}{" "}
                  {mainPriceDisplay?.secondary_text && (
                    <span className="mt-1 font-normal text-muted-foreground">
                      {mainPriceDisplay?.secondary_text}
                    </span>
                  )}
                </div>
              </h3>
            </div>
          </div>
          {showFeatures && featureItems.length > 0 && (
            <div className="flex-grow mb-6 px-6">
              <PricingFeatureList
                items={featureItems}
                everythingFrom={product.display?.everything_from}
              />
            </div>
          )}
        </div>
        <div
          className={cn("px-6", isRecommended && "lg:-translate-y-12")}
        >
          <PricingCardButton
            recommended={productDisplay?.recommend_text ? true : false}
            {...buttonProps}
          >
            {getButtonText()}
          </PricingCardButton>
        </div>
      </div>
    </div>
  );
};

// Pricing Feature List
export const PricingFeatureList = ({
  items,
  everythingFrom,
  className,
}: {
  items: ProductItem[];
  everythingFrom?: string;
  className?: string;
}) => {
  const t = useTranslations("pricing");
  
  // Get translated text for feature items
  const getFeatureText = (text: string | undefined) => {
    if (text && text.startsWith('pricing.')) {
      try {
        // Remove the 'pricing.' prefix to get the correct key
        const key = text.replace('pricing.', '');
        return t(key);
      } catch {
        // If translation fails, return the original text
        return text || '';
      }
    }
    return text || '';
  };

  return (
    <div className={cn("flex-grow", className)}>
      {everythingFrom && (
        <p className="mb-4 text-sm">
          {t("everythingFrom", { plan: everythingFrom })}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-2 text-sm"
          >
            <div className="flex flex-col">
              <span>{getFeatureText(item.display?.primary_text) || ''}</span>
              {item.display?.secondary_text && (
                <span className="text-muted-foreground text-sm">
                  {getFeatureText(item.display?.secondary_text) || ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pricing Card Button
export interface PricingCardButtonProps extends React.ComponentProps<"button"> {
  recommended?: boolean;
  buttonUrl?: string;
}

export const PricingCardButton = React.forwardRef<
  HTMLButtonElement,
  PricingCardButtonProps
>(({ recommended, children, className, onClick, ...props }, ref) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      await onClick?.(e);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={cn(
        "group relative hover:brightness-90 px-4 py-3 border rounded-lg w-full overflow-hidden transition-all duration-300 cursor-pointer",
        className
      )}
      {...props}
      variant={recommended ? "default" : "secondary"}
      ref={ref}
      disabled={loading || props.disabled}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <div className="flex justify-between items-center w-full transition-transform group-hover:translate-y-[-130%] duration-300">
            <span>{children}</span>
            <span className="text-sm">→</span>
          </div>
          <div className="absolute flex justify-between items-center mt-2 group-hover:mt-0 px-4 w-full transition-transform translate-y-[130%] group-hover:translate-y-0 duration-300">
            <span>{children}</span>
            <span className="text-sm">→</span>
          </div>
        </>
      )}
    </Button>
  );
});
PricingCardButton.displayName = "PricingCardButton";

// Annual Switch
export const AnnualSwitch = ({
  isAnnualToggle,
  setIsAnnualToggle,
}: {
  isAnnualToggle: boolean;
  setIsAnnualToggle: (isAnnual: boolean) => void;
}) => {
  const t = useTranslations("pricing.table");
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-muted-foreground text-sm">{t("monthly")}</span>
      <Switch
        id="annual-billing"
        checked={isAnnualToggle}
        onCheckedChange={setIsAnnualToggle}
      />
      <span className="text-muted-foreground text-sm">{t("annual")}</span>
    </div>
  );
};

export const RecommendedBadge = ({ recommended }: { recommended: string }) => {
  return (
    <div className="top-[-1px] lg:top-4 right-[-1px] lg:right-4 absolute bg-secondary px-3 lg:py-0.5 border lg:rounded-full rounded-bl-lg font-medium text-muted-foreground text-sm">
      {recommended}
    </div>
  );
};
