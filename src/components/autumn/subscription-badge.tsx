"use client";

import { Badge } from "@/components/ui/badge";
import { useActiveProduct, useOrganizationId } from "@/hooks/use-app-store";
import { useTranslations } from "next-intl";

interface SubscriptionBadgeProps {
    variant?: "default" | "text";
    className?: string;
}

function SubscriptionBadge({ variant = "default", className }: SubscriptionBadgeProps) {
    const t = useTranslations("pricing.table");
    const activeProduct = useActiveProduct();
    const organizationId = useOrganizationId();

    // If no organization, show null but should also never happen
    if (!organizationId) {
        return null;
    }

    // Show active product or Free
    const displayText = activeProduct?.name || t("error");
    const isFree = !activeProduct;

    return (
        <>
            {variant === "text" ? (
                <span className="font-bold">{displayText}</span>
            ) : (
                <Badge variant={isFree ? "outline" : "default"} className={className}>
                    {displayText}
                </Badge>
            )}
        </>
    );
}

export { SubscriptionBadge };