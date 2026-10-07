export interface User {
    userName: string;
    userDesignation: string;
    primaryRoleCode: string;
    loginUserName: string;
}

export interface LoginResponse {
    outcome?: boolean;
    data?: {
        token: string;
        user: User;
        menu: MenuItem[];
    };
    token?: string;
    user?: User;
    menu?: any[];
    message?: string;
}

export interface CaptchaResponse {
    outcome?: boolean;
    data?: {
        captchaToken: string;
        captchaImage: string;
    };
    captchaToken?: string;
    captchaImage?: string;
    message?: string;
}

export interface SubMenuItem {
    title: string;
    link: string;
    icon?: string;
    subMenu?: SubMenuItem[];
}

export interface MenuItem {
    title: string;
    icon: string;
    link: string;
    subMenu: SubMenuItem[];
}

export interface LoginRequest {
    userName: string;
    password?: string;
    captcha: string;
    captchaToken?: string;
}

export type LoginMode = "password" | "otp";

export interface SendOtpRequest {
    identifier: string; // Mobile or User ID
    purpose: "login" | "reset_password";
}

export interface OtpLoginRequest {
    identifier: string;
    otp: string;
    captcha: string;
}

export interface ResetPasswordRequest {
    identifier: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

export interface LockoutState {
    failedAttempts: number;
    maxAttempts: number;
    isLocked: boolean;
    lockoutExpiry: number | null;
}
