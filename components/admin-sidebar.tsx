"use client"
  
import Link from "next/link"  
import { usePathname } from "next/navigation"  
import { cn } from "@/lib/utils"  
import { LayoutDashboard, Users, BookOpen, BarChart3, GraduationCap, Tags } from "lucide-react"
  
const navigation = [  
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },  
  { name: "Cursos", href: "/admin/courses", icon: BookOpen },  
  { name: "Categorías", href: "/admin/categories", icon: Tags }, // ← NUEVO  
  { name: "Usuarios", href: "/admin/users", icon: Users },  
  { name: "Estadísticas", href: "/admin/analytics", icon: BarChart3 },  
]
  
export function AdminSidebar() {  
  const pathname = usePathname()
  
  return (  
    <aside className="w-64 border-r bg-card flex flex-col">  
      <div className="p-6 border-b">  
        <div className="flex items-center gap-3">  
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">  
            <GraduationCap className="h-6 w-6 text-primary-foreground" />  
          </div>  
          <div>  
            <h2 className="font-bold text-lg text-foreground">Panel Admin</h2>  
            <p className="text-xs text-muted-foreground">Thomson Reuters</p>  
          </div>  
        </div>  
      </div>
  
      <nav className="flex-1 p-4 space-y-1">  
        {navigation.map((item) => {  
          const isActive = pathname === item.href  
          return (  
            <Link  
              key={item.name}  
              href={item.href}  
              className={cn(  
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",  
                isActive  
                  ? "bg-primary text-primary-foreground"  
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",  
              )}  
            >  
              <item.icon className="h-5 w-5" />  
              {item.name}  
            </Link>  
          )  
        })}  
      </nav>
  
      <div className="p-4 border-t">  
        <Link href="/dashboard">  
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">  
            <LayoutDashboard className="h-5 w-5" />  
            Vista Estudiante  
          </div>  
        </Link>  
      </div>  
    </aside>  
  )  
}  