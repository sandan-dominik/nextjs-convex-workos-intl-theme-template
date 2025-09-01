import PricingTable from "@/components/autumn/pricing-table";
import { productDetails } from "@/lib/autumn/pricing-table-content";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SubscriptionPage() {
    return (
        <div className="flex flex-col justify-center items-center gap-6 min-h-svh">
            <div className="block w-full max-w-xl">
            <PricingTable productDetails={productDetails} />
            </div>
            <Button><Link href="/dashboard">Back to Dashboard</Link></Button>
        </div>
    );
}