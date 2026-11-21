import { z } from "zod";
import {
  formInteger,
  formOptionalId,
  formText,
  parseForm,
  type ParsedForm,
} from "@/lib/validation/form";
import {
  optionalHttpsUrlSchema,
  optionalPhoneSchema,
} from "@/lib/validation/schemas";

const phoneSchema = z
  .string()
  .trim()
  .min(6, "Enter a contact number.")
  .max(50)
  .regex(/^[0-9+()\-.\s]+$/, "Use digits, spaces and + ( ) - only.");

const optionalPhone = optionalPhoneSchema({
  message: "Use digits, spaces and + ( ) - only.",
  minLength: 6,
});

export const sellerSchema = z.object({
  name: z.string().trim().min(2, "Seller name is required.").max(200),
  city: z.string().trim().min(2, "City is required.").max(120),
  address: z.string().trim().min(2, "Address is required.").max(300),
  phone: phoneSchema,
  whatsapp: optionalPhone,
  googleMapsUrl: optionalHttpsUrlSchema,
  imageMediaId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  sortOrder: z.number().int().min(-100000).max(100000).default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type SellerInput = z.infer<typeof sellerSchema>;

export function parseSellerForm(formData: FormData): ParsedForm<SellerInput> {
  return parseForm(sellerSchema, {
    name: formText(formData.get("name")),
    city: formText(formData.get("city")),
    address: formText(formData.get("address")),
    phone: formText(formData.get("phone")),
    whatsapp: formText(formData.get("whatsapp")),
    googleMapsUrl: formText(formData.get("googleMapsUrl")),
    imageMediaId: formOptionalId(formData.get("imageMediaId")),
    sortOrder: formInteger(formData.get("sortOrder")),
    status: formText(formData.get("status")) || "active",
  });
}
