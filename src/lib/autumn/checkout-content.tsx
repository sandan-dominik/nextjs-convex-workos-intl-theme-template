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
      title: "checkout.titles.purchase",
      titleParams: { productName },
      message: "checkout.messages.purchase",
      messageParams: { productName },
    };
  }

  if (scenario == "active" && updateable) {
    if (updateable) {
      return {
        title: "checkout.titles.updatePlan",
        message: "checkout.messages.updatePlan",
      };
    }
  }

  if (has_trial) {
    return {
      title: "checkout.titles.startTrial",
      titleParams: { productName },
      message: "checkout.messages.startTrial",
      messageParams: { productName, nextCycleAtStr },
    };
  }

  switch (scenario) {
    case "scheduled":
      return {
        title: "checkout.titles.productScheduled",
        titleParams: { productName },
        message: "checkout.messages.productScheduled",
        messageParams: { productName, currentProductName: current_product.name, nextCycleAtStr },
      };

    case "active":
      return {
        title: "checkout.titles.productActive",
        message: "checkout.messages.productActive",
      };

    case "new":
      if (is_free) {
        return {
          title: "checkout.titles.enableProduct",
          titleParams: { productName },
          message: "checkout.messages.enableProduct",
          messageParams: { productName },
        };
      }

      return {
        title: "checkout.titles.subscribeTo",
        titleParams: { productName },
        message: "checkout.messages.subscribeTo",
        messageParams: { productName },
      };
    case "renew":
      return {
        title: "checkout.titles.renew",
        message: "checkout.messages.renew",
        messageParams: { productName },
      };

    case "upgrade":
      return {
        title: "checkout.titles.upgradeTo",
        titleParams: { productName },
        message: "checkout.messages.upgradeTo",
        messageParams: { productName },
      };

    case "downgrade":
      return {
        title: "checkout.titles.downgradeTo",
        titleParams: { productName },
        message: "checkout.messages.downgradeTo",
        messageParams: { productName, currentProductName: current_product.name, nextCycleAtStr },
      };

    case "cancel":
      return {
        title: "checkout.titles.cancel",
        message: "checkout.messages.cancel",
        messageParams: { currentProductName: current_product.name, nextCycleAtStr },
      };

    default:
      return {
        title: "checkout.titles.changeSubscription",
        message: "checkout.messages.changeSubscription",
      };
  }
};
