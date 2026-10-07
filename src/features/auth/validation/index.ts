import { z } from "zod";

export const loginSchema = z.object({
    userName: z.string().min(1, "Username or Mobile is required"),
    password: z.string().min(1, "Password is required"),
    captcha: z.string().min(4, "4-digit Captcha is required"),
});

export const otpLoginSchema = z.object({
    identifier: z.string().min(1, "Mobile Number or User ID is required"),
    otp: z.string().length(6, "6-digit OTP is required"),
    captcha: z.string().min(4, "4-digit Captcha is required"),
});

export const resetPasswordSchema = z
    .object({
        identifier: z.string().min(1, "Mobile Number or User ID is required"),
        otp: z.string().length(6, "6-digit OTP is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type LoginFormInputs = z.infer<typeof loginSchema>;
export type OtpLoginFormInputs = z.infer<typeof otpLoginSchema>;
export type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;
