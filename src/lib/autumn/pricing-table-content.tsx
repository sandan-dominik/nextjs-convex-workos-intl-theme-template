import { type Product } from "autumn-js";

export const getPricingTableContent = (product: Product) => {
  const { scenario, properties } = product;
  const { is_one_off, updateable, has_trial } = properties;

  if (has_trial) {
    return {
      buttonText: "pricing.buttons.startFreeTrial",
    };
  }

  switch (scenario) {
    case "scheduled":
      return {
        buttonText: "pricing.buttons.planScheduled",
      };

    case "active":
      if (updateable) {
        return {
          buttonText: "pricing.buttons.updatePlan",
        };
      }

      return {
        buttonText: "pricing.buttons.currentPlan",
      };

    case "new":
      if (is_one_off) {
        return {
          buttonText: "pricing.buttons.purchase",
        };
      }

      return {
        buttonText: "pricing.buttons.getStarted",
      };

    case "renew":
      return {
        buttonText: "pricing.buttons.renew",
      };

    case "upgrade":
      return {
        buttonText: "pricing.buttons.upgrade",
      };

    case "downgrade":
      return {
        buttonText: "pricing.buttons.downgrade",
      };

    case "cancel":
      return {
        buttonText: "pricing.buttons.cancelPlan",
      };

    default:
      return {
        buttonText: "pricing.buttons.getStarted",
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
      name: "pricing.plans.free.name",
      description: "pricing.plans.free.description",
      
      // This text appears as the main button text.
      button_text: "pricing.plans.free.buttonText", 
    },
    // 'items' lets you define exactly what feature text to show.
    items: [
      {
        // This 'feature_id' must match the feature 'id' in autumn.config.ts
        feature_id: "seats", 
        display: {
          primary_text: "pricing.features.seats.free",
        },
      },
      {
        feature_id: "credits",
        display: {
          primary_text: "pricing.features.credits.free",
          secondary_text: "pricing.features.credits.freeDescription",
        },
      },
      {
        // You can also add features that aren't in your Autumn config.
        // Use a unique 'feature_id' for these.
        feature_id: "support_tier_free", 
        display: {
          primary_text: "pricing.features.support.free",
        },
      },
    ],
  },

  // --- PRO PLAN DETAILS ---
  {
    id: "pro",
    display: {
      name: "pricing.plans.pro.name",
      description: "pricing.plans.pro.description",
      
      // This makes the Pro card stand out, as seen in your component code.
      recommend_text: "pricing.table.recommended", 
      
      // The default button text will be "Upgrade" or "Manage", 
      // but you can override it here if needed.
      // button_text: "pricing.plans.pro.buttonText", 
    },
    items: [
      {
        // This is the base price item. The text here will override what Autumn sends.
        // The 'id' for price items is auto-generated, so we don't specify it.
        display: {
          primary_text: "pricing.price.pro",
          secondary_text: "pricing.price.perMonth",
        },
      },
      {
        feature_id: "seats",
        display: {
          primary_text: "pricing.features.seats.pro",
          secondary_text: "pricing.features.seats.additionalSeat",
        },
      },
      {
        feature_id: "credits",
        display: {
          primary_text: "pricing.features.credits.pro",
        },
      },
      {
        feature_id: "support_tier_pro",
        display: {
          primary_text: "pricing.features.support.pro",
        },
      },
    ],
  },
];