export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status?: string;
};

export type AuthCustomer = {
  id: string;
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
  customer?: AuthCustomer | null;
};

const TOKEN_KEY = "access_token";
const USER_ID_KEY = "userId";
const CUSTOMER_ID_KEY = "customerId";

export function saveAuth(data: AuthResponse) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_ID_KEY, data.user.id);

  if (data.customer?.id) {
    localStorage.setItem(CUSTOMER_ID_KEY, data.customer.id);
  } else {
    localStorage.removeItem(CUSTOMER_ID_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function getCustomerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_ID_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken() && !!getUserId();
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(CUSTOMER_ID_KEY);
}

export type AppRole =
  | "SUPER_ADMIN"
  | "MANAGER"
  | "KITCHEN_STAFF"
  | "DELIVERY_STAFF"
  | "ACCOUNTANT";

export function getRole(): AppRole | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      decodeURIComponent(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map(
            (char) =>
              "%" +
              ("00" + char.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );

    const role = payload?.role;

    if (
      role === "SUPER_ADMIN" ||
      role === "MANAGER" ||
      role === "KITCHEN_STAFF" ||
      role === "DELIVERY_STAFF" ||
      role === "ACCOUNTANT"
    ) {
      return role;
    }

    return null;
  } catch {
    return null;
  }
}

