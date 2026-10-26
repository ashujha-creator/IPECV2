"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  FolderKanban,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/dist/client/components/navigation";

// Simple navigation configuration with menus and submenus
const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    items: [
      { title: "Overview", url: "/dashboard/overview" },
      { title: "Analytics", url: "/dashboard/analytics" },
    ],
  },
  {
    title: "Management",
    icon: Users,
    url: "#",
    items: [
      { title: "Users", url: "/management/users" },
      { title: "Roles", url: "/management/roles" },
    ],
  },
  {
    title: "Projects",
    icon: FolderKanban,
    url: "/dashboard/projects",
  },
  {
    title: "Documents",
    icon: FileText,
    url: "/dashboard/documents",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Track which dropdown menus are open
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({
    Dashboard: true, // Default open section
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleSignOut = async () => {
    setLoading(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          router.refresh();
        },
      },
    });
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* HEADER: Company Logo & Name */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="relative flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden bg-sidebar-primary">
                <Image
                  src="/logo1.png"
                  alt="Enryu Logo"
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">IPEC</span>
                <span className="truncate text-xs text-muted-foreground">
                  Workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT: Menus & Submenus */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const hasSubmenu = item.items && item.items.length > 0;
              const isOpen = openMenus[item.title];

              return (
                <SidebarMenuItem key={item.title}>
                  {hasSubmenu ? (
                    // Menu with Submenus
                    <div>
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.title)}
                        tooltip={item.title}
                        className="w-full justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`size-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </SidebarMenuButton>

                      {isOpen && (
                        <div className="ml-6 mt-1 flex flex-col gap-1 border-l pl-2">
                          {item.items?.map((sub) => (
                            <Link
                              key={sub.title}
                              href={sub.url}
                              className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Direct Link Menu
                    <SidebarMenuButton tooltip={item.title}>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER: Settings & Logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
