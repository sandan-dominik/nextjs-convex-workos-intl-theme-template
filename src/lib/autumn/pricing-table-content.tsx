import { type Product } from "autumn-js";

export const getPricingTableContent = (product: Product) => {
  const { scenario, properties } = product;
  const { is_one_off, updateable, has_trial } = properties;

  if (has_trial) {
    return {
      buttonText: <p>Start Free Trial</p>,
    };
  }

  switch (scenario) {
    case "scheduled":
      return {
        buttonText: <p>Plan Scheduled</p>,
      };

    case "active":
      if (updateable) {
        return {
          buttonText: <p>Update Plan</p>,
        };
      }

      return {
        buttonText: <p>Current Plan</p>,
      };

    case "new":
      if (is_one_off) {
        return {
          buttonText: <p>Purchase</p>,
        };
      }

      return {
        buttonText: <p>Get started</p>,
      };

    case "renew":
      return {
        buttonText: <p>Renew</p>,
      };

    case "upgrade":
      return {
        buttonText: <p>Upgrade</p>,
      };

    case "downgrade":
      return {
        buttonText: <p>Downgrade</p>,
      };

    case "cancel":
      return {
        buttonText: <p>Cancel Plan</p>,
      };

    default:
      return {
        buttonText: <p>Get Started</p>,
      };
  }
};

export const productDetails = [
  // --- FREE PLAN DETAILS ---
  {
    // This 'id' must match the 'id' in your autumn.config.ts
    id: "free", 
    display: {
      // 'name' and 'description' will be shown on the pricing card.
      name: "Free",
      description: "For individuals and small projects just getting started.",
      
      // This text appears as the main button text.
      button_text: "Get Started", 
    },
    // 'items' lets you define exactly what feature text to show.
    items: [
      {
        // This 'feature_id' must match the feature 'id' in autumn.config.ts
        feature_id: "seats", 
        display: {
          primary_text: "1 user seat included",
        },
      },
      {
        feature_id: "credits",
        display: {
          primary_text: "10 credits per month",
          secondary_text: "For sending messages and other actions.",
        },
      },
      {
        // You can also add features that aren't in your Autumn config.
        // Use a unique 'feature_id' for these.
        feature_id: "support_tier_free", 
        display: {
          primary_text: "Community support",
        },
      },
    ],
  },

  // --- PRO PLAN DETAILS ---
  {
    id: "pro",
    display: {
      name: "Pro",
      description: "For growing teams that need more power and collaboration.",
      
      // This makes the Pro card stand out, as seen in your component code.
      recommend_text: "Most Popular", 
      
      // The default button text will be "Upgrade" or "Manage", 
      // but you can override it here if needed.
      // button_text: "Upgrade to Pro", 
    },
    items: [
      {
        // This is the base price item. The text here will override what Autumn sends.
        // The 'id' for price items is auto-generated, so we don't specify it.
        display: {
          primary_text: "$29",
          secondary_text: "per month",
        },
      },
      {
        feature_id: "seats",
        display: {
          primary_text: "3 user seats included",
          secondary_text: "$10/month for each additional seat.",
        },
      },
      {
        feature_id: "credits",
        display: {
          primary_text: "500 credits per month",
        },
      },
      {
        feature_id: "support_tier_pro",
        display: {
          primary_text: "Email & priority support",
        },
      },
    ],
  },
];