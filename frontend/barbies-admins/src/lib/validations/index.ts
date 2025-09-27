import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Product Schemas
export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().min(0, "Minimum price cannot be negative").optional(),
  maxPrice: z.number().min(0, "Maximum price cannot be negative").optional(),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .optional(),
  inStock: z.boolean().optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "rating", "newest", "popularity"])
    .optional(),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must not exceed 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters"),
  sellPrice: z.number().min(0.01, "Selling price must be greater than 0"),
  originalPrice: z.number().min(0.01, "Original price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  inventory: z
    .number()
    .int("Inventory must be a whole number")
    .min(0, "Inventory cannot be negative"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  tags: z.array(z.string()).optional(),
});

// Address Schema
export const addressSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  street: z
    .string()
    .min(1, "Street address is required")
    .max(100, "Street address must not exceed 100 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must not exceed 50 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(50, "State must not exceed 50 characters"),
  zipCode: z
    .string()
    .min(1, "ZIP code is required")
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters"),
});

// Cart Schema
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(10, "Maximum quantity is 10"),
  variantId: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(10, "Maximum quantity is 10"),
});

// Order Schema
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1"),
        variantId: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
});

// Contact Form Schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must not exceed 200 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters"),
});

// Newsletter Schema
export const newsletterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

// Search Schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query must not exceed 100 characters"),
  filters: productFilterSchema.optional(),
});

// API Response Schema
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: dataSchema,
    message: z.string(),
    success: z.boolean(),
    status: z.number(),
  });

// Pagination Schema
export const paginationSchema = z.object({
  page: z
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1"),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Maximum limit is 100"),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFilterData = z.infer<typeof productFilterSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type AddToCartData = z.infer<typeof addToCartSchema>;
export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
