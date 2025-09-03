import { type CheckoutResult } from "autumn-js";

export const getCheckoutContent = (checkoutResult: CheckoutResult) => {
  const { product, current_product, next_cycle } = checkoutResult;
  const { is_one_off, is_free, has_trial, updateable } = product.properties;
  const scenario = product.scenario;

  const nextCycleAtStr = next_cycle
    ? new Date(next_cycle.starts_at).toLocaleDateString()
    : undefined;

  const productName = product.name;

  if (is_one_off) {
    return {
      title: "titles.purchase",
      titleParams: { productName },
      message: "messages.purchase",
      messageParams: { productName },
    };
  }

  if (scenario == "active" && updateable) {
    if (updateable) {
      return {
        title: "titles.updatePlan",
        message: "messages.updatePlan",
      };
    }
  }

  if (has_trial) {
    return {
      title: "titles.startTrial",
      titleParams: { productName },
      message: "messages.startTrial",
      messageParams: { productName, nextCycleAtStr },
    };
  }

  switch (scenario) {
    case "scheduled":
      return {
        title: "titles.productScheduled",
        titleParams: { productName },
        message: "messages.productScheduled",
        messageParams: { productName, currentProductName: current_product.name, nextCycleAtStr },
      };

    case "active":
      return {
        title: "titles.productActive",
        message: "messages.productActive",
      };

    case "new":
      if (is_free) {
        return {
          title: "titles.enableProduct",
          titleParams: { productName },
          message: "messages.enableProduct",
          messageParams: { productName },
        };
      }

      return {
        title: "titles.subscribeTo",
        titleParams: { productName },
        message: "messages.subscribeTo",
        messageParams: { productName },
      };
    case "renew":
      return {
        title: "titles.renew",
        message: "messages.renew",
        messageParams: { productName },
      };

    case "upgrade":
      return {
        title: "titles.upgradeTo",
        titleParams: { productName },
        message: "messages.upgradeTo",
        messageParams: { productName },
      };

    case "downgrade":
      return {
        title: "titles.downgradeTo",
        titleParams: { productName },
        message: "messages.downgradeTo",
        messageParams: { productName, currentProductName: current_product.name, nextCycleAtStr },
      };

    case "cancel":
      return {
        title: "titles.cancel",
        message: "messages.cancel",
        messageParams: { currentProductName: current_product.name, nextCycleAtStr },
      };

    default:
      return {
        title: "titles.changeSubscription",
        message: "messages.changeSubscription",
      };
  }
};
