"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRole, getToken, getUserId, type AppRole } from "@/lib/auth";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/menu"
  );
}

function requiredRole(
  pathname: string
): AppRole[] | null {

  if (
    pathname === "/offers" ||
    pathname.startsWith("/offers/")
  ) {
    return ["SUPER_ADMIN", "MANAGER"];
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return ["SUPER_ADMIN", "MANAGER"];
  }

  if (
    pathname === "/kitchen" ||
    pathname.startsWith("/kitchen/")
  ) {
    return ["SUPER_ADMIN", "MANAGER", "KITCHEN_STAFF"];
  }

  if (
    pathname === "/delivery" ||
    pathname.startsWith("/delivery/")
  ) {
    return ["SUPER_ADMIN", "MANAGER", "DELIVERY_STAFF"];
  }

  if (
    pathname === "/rider" ||
    pathname.startsWith("/rider/")
  ) {
    return ["DELIVERY_STAFF"];
  }

  return null;
}

export default function AuthRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isPublicPath(pathname)) {
      setChecking(false);
      return;
    }

    const token = getToken();
    const userId = getUserId();
    const role = getRole();

    // Protected pages require login.
    if (!token || !userId) {
      router.replace("/login");
      return;
    }

    const allowedRoles = requiredRole(pathname);

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      router.replace(role ? "/menu" : "/login");
      return;
    }

    // Customer-only pages.
    const isCustomerOnly = pathname === "/orders" ||
      pathname === "/orders/";

    const staffRoles: AppRole[] = [
      "SUPER_ADMIN",
      "MANAGER",
      "KITCHEN_STAFF",
      "DELIVERY_STAFF",
      "ACCOUNTANT",
    ];

    if (
      isCustomerOnly &&
      role &&
      staffRoles.includes(role)
    ) {
      router.replace("/menu");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c0d] text-white/50">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}




