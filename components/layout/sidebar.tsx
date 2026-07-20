"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Building2,
  Factory,
  TrendingUp,
  Warehouse,
  Receipt,
  UserPlus,
  Calculator,
  MapPin,
  ClipboardList,
  DollarSign,
  Shield,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const holdingsNav: NavItem[] = [
  { title: "Dashboard", href: "/holdings", icon: LayoutDashboard },
  { title: "Companies", href: "/holdings/companies", icon: Building2 },
  { title: "Users", href: "/holdings/users", icon: Users },
]

const supplyNav: NavItem[] = [
  { title: "CEO Dashboard", href: "/supply/ceo", icon: LayoutDashboard },
  { title: "Sales", href: "/supply/sales", icon: TrendingUp },
  { title: "Inventory", href: "/supply/inventory", icon: Warehouse },
  { title: "Purchasing", href: "/supply/purchasing", icon: ShoppingCart },
  { title: "Finance", href: "/supply/finance", icon: Receipt },
  { title: "Expenses", href: "/supply/expenses", icon: Receipt },
  { title: "Clients", href: "/supply/clients", icon: Users },
  { title: "Suppliers", href: "/supply/suppliers", icon: UserPlus },
  { title: "Quotations", href: "/supply/quotations", icon: FileText },
]

const manufacturingNav: NavItem[] = [
  { title: "CEO Dashboard", href: "/manufacturing/ceo", icon: LayoutDashboard },
  { title: "Production", href: "/manufacturing/production", icon: Factory },
  { title: "Costing", href: "/manufacturing/costing", icon: Calculator },
  { title: "Inventory", href: "/manufacturing/inventory", icon: Warehouse },
  { title: "Sales", href: "/manufacturing/sales", icon: TrendingUp },
  { title: "Finance", href: "/manufacturing/finance", icon: Receipt },
]

const marketingNav: NavItem[] = [
  { title: "Dashboard", href: "/marketing", icon: LayoutDashboard },
  { title: "Agents", href: "/marketing/agents", icon: Users },
  { title: "Distributors", href: "/marketing/distributors", icon: Users },
  { title: "Territories", href: "/marketing/territories", icon: MapPin },
  { title: "Commission Rules", href: "/marketing/commission-rules", icon: ClipboardList },
  { title: "Orders", href: "/marketing/orders", icon: ShoppingCart },
  { title: "Distributor Inventory", href: "/marketing/inventory", icon: Package },
  { title: "Payouts", href: "/marketing/payouts", icon: DollarSign },
  { title: "Audit Trail", href: "/marketing/audit", icon: Shield },
]

interface SidebarProps {
  userRole: string
  companyName: string
}

export function Sidebar({ userRole, companyName }: SidebarProps) {
  const pathname = usePathname()

  const getNavItems = () => {
    if (userRole === "SUPER_ADMIN") {
      return [
        { title: "ESPS Holdings", items: holdingsNav },
        { title: "ESPS Supply Corp", items: supplyNav },
        { title: "ESPS Manufacturing", items: manufacturingNav },
        { title: "ESPS Sales & Marketing", items: marketingNav },
      ]
    }

    if (companyName.includes("Supply")) {
      return [{ title: "ESPS Supply Corp", items: supplyNav }]
    }

    if (companyName.includes("Manufacturing")) {
      return [{ title: "ESPS Manufacturing", items: manufacturingNav }]
    }

    if (companyName.includes("Marketing")) {
      return [{ title: "ESPS Sales & Marketing", items: marketingNav }]
    }

    return []
  }

  const sections = getNavItems()

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Image
          src="/images/esps-logo.jpg"
          alt="ESPS Logo"
          width={80}
          height={32}
          className="object-contain"
        />
      </div>
      <nav className="space-y-6 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
