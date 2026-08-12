import { z } from "zod";

export const issueTypeEnum = z.enum([
  "BROKEN_LINK_OR_BUTTON",
  "VISUAL_LAYOUT_GLITCH",
  "FORM_SUBMISSION_ERROR",
  "MOBILE_SCREEN_DISPLAY",
  "OTHER_WEBSITE_BUG",
]);

export const issueReportSchema = z.object({
  name: z
  .string()
  .trim()
  .optional()
  .or(z.literal("")),

  email: z
  .string()
  .trim()
  .max(50, "Email address is too long")
  .email("Please enter a valid email address.")
  .toLowerCase(),

  issueType: issueTypeEnum,

  details: z
  .string()
  .trim()
  .min(5, "Please provide more details about the issue.")
  .max(600, "You've reached the character limit. Please provide a shorter description of the issue."),
});