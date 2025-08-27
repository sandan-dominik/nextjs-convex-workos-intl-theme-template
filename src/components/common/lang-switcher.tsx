"use client"

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Globe } from "lucide-react";
import { DE, GB } from "country-flag-icons/react/3x2";

type Props = {
    variant?: "default" | "flag";
  };

export function LanguageSwitcher({ variant = "default" }: Props) {
    const [currentLocale, setCurrentLocale] = useState<'en' | 'de'>('de');
    const t = useTranslations("common.langSwitcher");
    const router = useRouter();

    // Get current locale from cookie or browser language on client side
    useEffect(() => {
        const getCurrentLocale = (): 'en' | 'de' => {
            // First check for existing cookie
            const match = document.cookie.match('(^|;)\\s*locale\\s*=\\s*([^;]+)');
            if (match) {
                const cookieLocale = match.pop() as 'en' | 'de';
                if (cookieLocale === 'en' || cookieLocale === 'de') {
                    return cookieLocale;
                }
            }

            // If no valid cookie, check browser language
            const browserLang = navigator.language || navigator.languages?.[0] || 'de';

            // Map browser language to supported locales
            if (browserLang.startsWith('de')) {
                return 'de';
            } else if (browserLang.startsWith('en')) {
                return 'en';
            }

            // Default fallback
            return 'de';
        };

        setCurrentLocale(getCurrentLocale());
    }, []);

    const switchLanguage = async (locale: 'en' | 'de') => {
        //close popover
        document.getElementById('language-switcher')?.click();
        // Set cookie
        document.cookie = `locale=${locale};path=/`;
        // Update local state immediately for better UX
        setCurrentLocale(locale);
        // Refresh the page to apply new locale
        router.refresh();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button id="language-switcher" className="cursor-pointer" variant="ghost" size="icon">
                    {variant === "default" ? <Globe className="w-5 h-5" /> : currentLocale === "de" ? <DE /> : <GB />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="mt-2 p-1 rounded-xl w-fit" align="end">
                <div className="flex flex-col gap-1">
                    <Button
                        className={`flex items-center justify-start gap-2 p-2 cursor-pointer text-xs`}
                        variant={'ghost'}
                        onClick={() => switchLanguage('de')}
                    >
                        <DE className="rounded-sm w-6 h-4" />
                        {t("de")}
                    </Button>
                    <Button
                        className={`flex items-center justify-start gap-2 p-2 cursor-pointer text-xs`}
                        variant={'ghost'}
                        onClick={() => switchLanguage('en')}
                    >
                        <GB className="rounded-sm w-6 h-4" />
                        {t("en")}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}