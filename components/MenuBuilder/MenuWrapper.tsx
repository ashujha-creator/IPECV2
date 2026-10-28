// components/MenuWrapper.tsx
import { getMenuItems } from "@/app/actions/menu-actions";
import MenuBuilder from "@/components/MenuBuilder/MenuBuilder";
import NavbarPreview from "@/components/MenuBuilder/NavbarPreview";

export default async function MenuWrapper() {
  const menuItems = await getMenuItems();

  return (
    <div className="space-y-8">
      <NavbarPreview items={menuItems} />
      <MenuBuilder initialItems={menuItems} />
    </div>
  );
}
