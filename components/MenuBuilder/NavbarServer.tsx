// components/MenuBuilder/NavbarServer.tsx
import {prisma} from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import { NavMenuContent, MenuItem } from "@/lib/nav-menu/navigation";
import { unstable_cache } from "next/cache";

const getNavMenu = unstable_cache(
  async () => {
    return await prisma.navMenu.findFirst({
      where: { key: "main" },
    });
  },
  ["main-nav-menu"],
  {
    revalidate: 3600, // Fallback revalidate every hour
    tags: ["nav-menu"], // <--- Add cache tag here
  }
);

export default async function NavbarServer() {
  const navRecord = await getNavMenu();
  if (!navRecord) return null;

  let menuItems: MenuItem[] = [];
  try {
    const parsedContent: NavMenuContent =
      typeof navRecord.content === "string"
        ? JSON.parse(navRecord.content)
        : navRecord.content;

    menuItems = (parsedContent.items || []).filter((item) => item.visible);
  } catch (error) {
    console.error("Failed to parse navigation menu content:", error);
  }

  return <NavbarClient items={menuItems} />;
}