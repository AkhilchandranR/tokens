"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({ children }: { children: ReactNode }) {
    return <nav className="flex justify-center px-4 bg-primary text-primary-foreground">
        {children}
    </nav>
};

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
    const pathname = usePathname();
    const isActive = pathname === props.href;
    return <Link 
    className={cn(
        "p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground", 
        isActive && "bg-background text-secondary-foreground")} 
    {...props} 
    />

}