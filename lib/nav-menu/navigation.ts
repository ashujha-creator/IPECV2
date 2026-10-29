// types/navigation.ts

export interface MenuItem {
  id: string;
  label: string;
  href: string | null;
  icon: string | null;
  badge: string | null;
  target: string;
  visible: boolean;
  disabled: boolean;
  children: MenuItem[];
}

export interface NavMenuContent {
  items: MenuItem[];
  schemaVersion: number;
}
