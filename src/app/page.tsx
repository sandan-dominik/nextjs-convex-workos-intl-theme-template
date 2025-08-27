import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations("HomePage");
  return (
    <div className="justify-items-center items-center gap-16 grid grid-rows-[20px_1fr_20px] p-8 sm:p-20 pb-20 min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center sm:items-start gap-8 row-start-2">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-[family-name:var(--font-geist-mono)] text-sm sm:text-left text-center list-decimal list-inside">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="mb-2">Shadcn UI Components Integrated</li>
          <li className="mb-2">Next Theme (Dark/light) Integrated + Toggle</li>
          <li className="mb-2">Next Intl Integrated + Language Switcher</li>
          <li className="mb-2">WorkOS Auth Integrated</li>
        </ol>

        <div className="flex sm:flex-row flex-col items-center gap-4">
          <Button variant="outline">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button variant="default">
            <Link href="/register">{t("register")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
