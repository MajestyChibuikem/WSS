import { Roles } from "./types";

export function calculateRevenueChange(
  currentRevenue: number,
  percentageChange?: number
): {
  amountChange: string;
  status: "gain" | "loss" | "no change";
  previousRevenue: string;
} {
  console.log("currentRevenue: ", currentRevenue, percentageChange);
  let computedPreviousRevenue;

  if (computedPreviousRevenue === undefined) {
    if (percentageChange !== undefined) {
      // Calculate previous revenue using the percentage change formula
      computedPreviousRevenue = currentRevenue / (1 + percentageChange / 100);
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

export function getInitials(name: string): string {
  const words = name.trim().split(" ");

  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return words[0].slice(0, 2).toUpperCase();
}

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
  console.log("value: ", value);
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
