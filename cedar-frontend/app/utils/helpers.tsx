import { Roles } from "./types";

export function calculateRevenueChange(
  currentRevenue: number,
  growth_factor?: number
): {
  amountChange: string;
  status: "gain" | "loss" | "no change";
  previousRevenue: string;
} {
  let computedPreviousRevenue;

  if (computedPreviousRevenue === undefined) {
    if (growth_factor !== undefined) {
      // Calculate previous revenue using the percentage change formula
      computedPreviousRevenue =
        currentRevenue /
        (1 + convertGrowthFactorToPercentage(growth_factor) / 100);
    } else {
      // If both previousRevenue and percentageChange are missing, return "N/A"
      return {
        amountChange: "₦0.00",
        status: "no change",
        previousRevenue: "N/A",
      };
    }
  }

  const amountChange = currentRevenue - computedPreviousRevenue;

  return {
    amountChange: `₦${Math.abs(amountChange).toFixed(2)}`, // Always positive for clarity
    status: amountChange > 0 ? "gain" : amountChange < 0 ? "loss" : "no change",
    previousRevenue: `₦${computedPreviousRevenue.toFixed(2)}`,
  };
}

export function convertGrowthFactorToPercentage(growthFactor: number) {
  return (growthFactor - 1) * 100;
}

export function getInitials(name: string): string {
  const words = name.trim().split(" ");

  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return words[0].slice(0, 2).toUpperCase();
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  if (num >= 100) return (num / 100).toFixed(1) + "H";
  return num.toString();
};

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}

export const getRoleEnum = (role: string): Roles | undefined => {
  return Object.values(Roles).find((r) => r === role) as Roles | undefined;
};

export function formatDecimal(
  value: number
): { formatted: string; decimal: string } {
  // Round to 2 decimal places
  const roundedValue = Number(value).toFixed(2);

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = roundedValue.split(".");

  // Format the integer part with commas and add the ₦ sign
  const formattedInteger = `₦${integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  )}`;

  // Return both separately
  return {
    formatted: formattedInteger,
    decimal: decimalPart,
  };
}
