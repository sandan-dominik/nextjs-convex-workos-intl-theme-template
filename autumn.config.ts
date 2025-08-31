import {
	feature,
	product,
	featureItem,
	pricedFeatureItem,
	priceItem,
} from "atmn";

// --- 1. Define Your Features ---

export const seats = feature({
	id: "seats",
	name: "Seats",
	type: "continuous_use",
});

export const credits = feature({
	id: "credits",
	name: "Credits",
	type: "single_use",
});

export const messages = feature({
	id: "messages",
	name: "Messages",
	type: "credit_system",
	credit_schema: [
		{
			metered_feature_id: credits.id,
			credit_cost: 1,
		},
	],
});

// --- 2. Define Your Products (Plans) ---

// FREE PLAN
export const free = product({
	id: "free",
	name: "Free",
	items: [
		featureItem({
			feature_id: seats.id,
			included_usage: 1,
		}),
		featureItem({
			feature_id: credits.id,
			included_usage: 10,
			interval: "month",
		}),
	],
});

// PRO PLAN
export const pro = product({
	id: "pro",
	name: "Pro",
	items: [
		priceItem({
			price: 29,
			interval: "month",
		}),

		// THIS IS THE FIX:
		// One item now defines both the included seats and the overage price.
		pricedFeatureItem({
			feature_id: seats.id,
			included_usage: 3, // 3 seats are included...
			price: 10,           // ...and each one after that costs $10.
			interval: "month",
		}),

		featureItem({
			feature_id: credits.id,
			included_usage: 500,
			interval: "month",
		}),
	],
});

// --- 3. Export all products ---
export const allProducts = [free, pro];
