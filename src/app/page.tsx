import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { withAuth } from '@workos-inc/authkit-nextjs';
import TaskExample from "@/components/task-example";

export default async function Home() {
  const t = await getTranslations("HomePage");
  const { user } = await withAuth({ensureSignedIn: false});
  console.log(user);

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
          <li className="mb-2">{t("included.shadcn")}</li>
          <li className="mb-2">{t("included.next-themes")}</li>
          <li className="mb-2">{t("included.next-intl")}</li>
          <li className="mb-2">{t("included.workos")}</li>
          <li className="mb-2">{t("included.convex")}</li>
        </ol>

        <div className="flex sm:flex-row flex-col items-center gap-4">
            {user ? (
            <>
            <p>Welcome, {user.firstName} {user.lastName}</p>
            <Button variant="outline">
              <Link href="/workspace">Workspace</Link>
            </Button>
            </>
          ) : (
            <>
            <Button variant="outline">
              <Link href="/sign-in">{t("signIn")}</Link>
            </Button>
            <Button variant="default">
              <Link href="/sign-up">{t("signUp")}</Link>
            </Button>
            </>
          )}
        </div>

        <TaskExample />
      </main>
    </div>
  );
}