import { z } from "zod";

export const SERVICE_TYPES = [
  "installation",
  "regular-cleaning",
  "full-down-cleaning",
  "dismantling",
  "relocation",
  "troubleshooting",
  "repair",
  "charging-refrigerant",
  "repiping-reinsulation",
  "washing-machine",
];

export const bookingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long")
    .max(50, "Full name is too long")
    .regex(
    /^[A-Z][a-zA-Z'-]*(\s[A-Z][a-zA-Z'-]*)+$/,
    "Please capitalize each name properly (e.g. Juan Dela Cruz)"),

  email: z
  .string()
  .trim()
  .max(50, "Email address is too long")
  .email("Please enter a valid email address.")
  .toLowerCase(),

  phone: z
  .string()
  .trim()
    // 1. Sanitize: Remove spaces, dashes, and parentheses
  .transform((val) => val.replace(/[\s\-\(\)]/g, ""))
    // 2. Normalize: Convert "0917..." or "917..." into "+63917..."
  .transform((val) => {
    if (val.startsWith("0")) {
        return "+63" + val.slice(1);
    }
    if (val.startsWith("9")) {
        return "+63" + val;
    }
    return val; // leave as is to let refine handle invalid formats
    })
    // 3. Validate strict PH mobile format: +63 followed by '9' and 9 digits
    .refine((val) => /^\+639\d{9}$/.test(val), {
      message: "Please enter a valid PH contact number (e.g., +639171234567)",
    }),
    
    serviceType: z
    .enum([SERVICE_TYPES[0], ...SERVICE_TYPES.slice(1)], { message: "Please select a valid service type" }),
    
    bookingDate: z
    .coerce.date()
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Booking date cannot be in the past"),
    
    location: z
    .string()
    .trim()
    .min(3, "Please enter a valid service location")
    .max(45, "Location is too long")
    .regex(
      /^[\p{L}\p{N}\s.,'-]+$/u,
      "Location contains invalid characters"
    ),

    notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});