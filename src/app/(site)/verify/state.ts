/**
 * Client-safe state for the public model verification form.
 *
 * This module is deliberately separate from `actions.ts`: a `"use server"`
 * file may only export async functions, so the state type and its initial value
 * live here and are imported by both the form and the action.
 */

export type VerifyImage = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type VerifyState = {
  status: "idle" | "success" | "error" | "throttled" | "unavailable";
  message: string;
  model?: {
    productName: string;
    productPath: string;
    categoryName: string;
    registeredLabel: string;
    image: VerifyImage | null;
  };
};

export const initialVerifyState: VerifyState = {
  status: "idle",
  message: "",
};
