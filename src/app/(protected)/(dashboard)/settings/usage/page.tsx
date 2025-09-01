"use client";
import { useTranslations } from "next-intl";
import { UsageComponent } from "./_components/usage-card";
import { AutumnWrapper } from "@/app/(protected)/_components/autumn-wrapper";

export default function UsagePage() {
  const t = useTranslations("SettingsPage");

  return (
    <AutumnWrapper loadingVariant="none">
    <div className="flex flex-col flex-1 gap-6 p-6">
      <div className="space-y-4">
        <h1 className="font-bold text-3xl">{t("title")}</h1>

        <div className="gap-6 grid">
          <UsageComponent />
        </div>
      </div>
    </div>
    </AutumnWrapper>
  );
}
