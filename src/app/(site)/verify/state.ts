/**
 * Client-safe state for the public model verification form.
 *
 * This module is deliberately separate from `actions.ts`: a `"use server"`
 * file may only export async functions, so the state type and its initial value
 * live here and are imported by both the form and the action.
 */
export type VerifyState = {
  status: "idle" | "success" | "error" | "throttled";
  message: string;
  model?: {
    productName: string;
    productPath: string;
    categoryName: string;
    registeredLabel: string;
  };
};

export const initialVerifyState: VerifyState = {
  status: "idle",
  message: "",
};
