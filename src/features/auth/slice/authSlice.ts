import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../service/AuthService";
import { getJwtToken, setJwtToken, removeJwtToken } from "@/shared/utils/cookieUtils";
import { isTokenValid } from "@/shared/utils/authUtils";

interface AuthState {
    token: string | null;
    user: any;
    menu: any[];
    isAuthenticated: boolean;
    failedAttempts: number;
    isLocked: boolean;
    lockoutUntil: number | null;
}

const storedToken = getJwtToken();
const initialState: AuthState = {
    token: storedToken || null,
    user: null,
    menu: [],
    isAuthenticated: !!storedToken && isTokenValid(storedToken),
    failedAttempts: 0,
    isLocked: false,
    lockoutUntil: null,
};

const extractToken = (res: any, data: any): string | null => {
    if (typeof res === 'string' && res.length > 50) {
        return res;
    }
    if (typeof data === 'string' && data.length > 50) {
        return data;
    }
    return (
        data?.token ||
        res?.token ||
        data?.jwtToken ||
        res?.jwtToken ||
        data?.accessToken ||
        res?.accessToken ||
        null
    );
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            state.failedAttempts = 0;
            state.isLocked = false;
            state.lockoutUntil = null;
            setJwtToken(action.payload);
        },
        recordFailedAttempt: (state) => {
            state.failedAttempts += 1;
            if (state.failedAttempts >= 3) {
                state.isLocked = true;
                state.lockoutUntil = Date.now() + 60 * 1000; // 60 seconds lock
            }
        },
        resetFailedAttempts: (state) => {
            state.failedAttempts = 0;
            state.isLocked = false;
            state.lockoutUntil = null;
        },
        clearLockoutIfExpired: (state) => {
            if (state.lockoutUntil && Date.now() >= state.lockoutUntil) {
                state.isLocked = false;
                state.lockoutUntil = null;
                state.failedAttempts = 0;
            }
        },
        clearAuth: (state) => {
            state.token = null;
            state.user = null;
            state.menu = [];
            state.isAuthenticated = false;
            removeJwtToken();
        },
        checkToken: (state) => {
            if (state.token && !isTokenValid(state.token)) {
                state.token = null;
                state.user = null;
                state.menu = [];
                state.isAuthenticated = false;
                removeJwtToken();
            }
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                const res = payload as any;
                const outcome = res?.outcome;
                const data = res?.data || res;

                const token = extractToken(res, data);


                if (outcome === false || (!token && outcome !== true)) {
                    return;
                }

                if (token) {
                    state.token = token;
                    state.user = data?.user || (data?.loginUserName ? data : null);
                    state.menu = data?.menu || (Array.isArray(data) ? data : []);
                    state.isAuthenticated = true;
                    setJwtToken(token);
                }
            }
        );
        builder.addMatcher(
            authApi.endpoints.getUserProfile.matchFulfilled,
            (state, { payload }) => {
                const data = (payload as any)?.data || payload;
                if (data) {
                    state.user = data;
                }
            }
        );
        builder.addMatcher(
            authApi.endpoints.getMenuList.matchFulfilled,
            (state, { payload }) => {
                const data = (payload as any)?.data || payload;
                if (Array.isArray(data)) {
                    state.menu = data;
                } else if (data?.menu) {
                    state.menu = data.menu;
                }
            }
        );
        builder.addMatcher(
            authApi.endpoints.logout.matchFulfilled,
            (state) => {
                state.token = null;
                state.user = null;
                state.menu = [];
                state.isAuthenticated = false;
                removeJwtToken();
            }
        );
    },
});

export const {
    setToken,
    clearAuth,
    checkToken,
    recordFailedAttempt,
    resetFailedAttempts,
    clearLockoutIfExpired,
} = authSlice.actions;

export const selectAuth = (state: any) => state.auth;
export const selectToken = (state: any) => state.auth.token;
export const selectCurrentUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectFailedAttempts = (state: any) => state.auth?.failedAttempts || 0;
export const selectIsLocked = (state: any) => state.auth?.isLocked || false;
export const selectLockoutUntil = (state: any) => state.auth?.lockoutUntil || null;

export default authSlice.reducer;
