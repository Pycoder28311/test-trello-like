export interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  children?: SidebarItem[];
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}