import PricingTable from "@/components/autumn/pricing-table";
import { productDetails } from "@/lib/autumn/pricing-table-content";


export default function SubscriptionPage() {
    return (
        <div className="flex flex-col justify-center p-6 min-h-full">
            <div className="mx-auto w-full max-w-7xl">
                <PricingTable productDetails={productDetails} />
            </div>
        </div>
    );
}