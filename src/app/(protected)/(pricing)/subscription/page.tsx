import PricingTable from "@/components/autumn/pricing-table";
import { productDetails } from "@/lib/autumn/pricing-table-content";

export default function SubscriptionPage() {
    return (
        <div className="flex flex-col justify-center items-center gap-6 min-h-svh">
            <div className="block w-full max-w-xl">
                <PricingTable productDetails={productDetails} redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} />
            </div>
        </div>
    );
}