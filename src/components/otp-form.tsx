"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useTranslations } from "next-intl";

export default function OTPForm() {
  const t = useTranslations("OTPPage"); 
  return (
    <Card className="w-full md:w-[350px]">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          onComplete={(value) => alert(`value: ${value}`)}>
          <InputOTPGroup className="space-x-4 *:border! *:rounded-lg!">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-muted-foreground text-sm">
          {t("description")}
        </p>
      </CardContent>
    </Card>
  );
}
