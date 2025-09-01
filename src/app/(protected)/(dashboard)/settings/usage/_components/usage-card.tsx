"use client";

import { useCustomer } from "autumn-js/react";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CreditCard, AlertCircle } from "lucide-react";
import { SubscriptionBadge } from "@/components/autumn/subscription-badge";
import { useTranslations } from "next-intl";

interface UsageData {
  availableCredits: number;
  usedCredits: number;
  remainingCredits: number;
  usagePercentage: number;
}

export function UsageComponent() {
  const { customer, isLoading: customerLoading, check } = useCustomer();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const t = useTranslations("SettingsPage");

  const fetchUsageData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Wait for customer to be available
      if (!customer) {
        console.log('Customer not ready yet, waiting...');
        return;
      }

      const { data } = check({ featureId: "credits" });
      console.log('Autumn usage data:', data);
      
      if (data && data.included_usage !== undefined) {
        const availableCredits = data.included_usage;
        const usedCredits = data.usage || 0;
        const remainingCredits = availableCredits - usedCredits;
        const usagePercentage = availableCredits > 0 ? (usedCredits / availableCredits) * 100 : 0;
        
        setUsageData({
          availableCredits,
          usedCredits,
          remainingCredits,
          usagePercentage,
        });
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error('No usage data available');
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [customer, check]);

  // Wait for customer to be ready before fetching
  useEffect(() => {
    if (customer && !customerLoading) {
      // Add a small delay to ensure Autumn is fully ready
      const timer = setTimeout(() => {
        fetchUsageData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [customer, customerLoading, fetchUsageData]);

  // Auto-retry if we get no data
  useEffect(() => {
    if (!isLoading && !usageData && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying usage data fetch (${retryCount + 1}/3)...`);
        fetchUsageData();
      }, 2000 * (retryCount + 1)); // Increasing delay: 2s, 4s, 6s
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, usageData, retryCount, fetchUsageData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t("usageAndCredits")}
          </span>
          <div className="flex items-center gap-2">
            <SubscriptionBadge />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsageData}
              disabled={isLoading || customerLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("refresh")}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customerLoading ? (
          <div className="py-4 text-muted-foreground text-center">
            <RefreshCw className="mx-auto mb-2 w-4 h-4 animate-spin" />
            {t("loadingAutumnCustomerData")}
          </div>
        ) : !customer ? (
          <div className="flex items-center gap-2 bg-amber-50 p-4 rounded-lg text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">{t("autumnNotReady")}</p>
              <p className="text-sm">{t("waitingForCustomerDataToLoad")}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="bg-muted rounded w-24 h-4"></div>
              <div className="bg-muted rounded w-16 h-4"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="bg-muted rounded w-20 h-4"></div>
              <div className="bg-muted rounded w-16 h-4"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="bg-muted rounded w-28 h-4"></div>
              <div className="bg-muted rounded w-16 h-4"></div>
            </div>
            <div className="bg-muted rounded h-2"></div>
          </div>
        ) : usageData ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("availableCredits")}</span>
                <span className="font-semibold">{usageData.availableCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("usedCredits")}</span>
                <span className="font-semibold">{usageData.usedCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("remainingCredits")}</span>
                <span className="font-semibold">{usageData.remainingCredits.toLocaleString()}</span>
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex bg-muted rounded h-2 overflow-hidden text-xs">
                <div 
                  style={{ width: `${usageData.usagePercentage}%` }}
                  className="flex flex-col justify-center bg-primary shadow-none text-white text-center whitespace-nowrap transition-all duration-300"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="py-4 text-muted-foreground text-center">
            {retryCount > 0 && (
              <p className="mb-2 text-sm">{t("retrying")} ({retryCount}/3)</p>
            )}
            {t("noUsageDataAvailable")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}