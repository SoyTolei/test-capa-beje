import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

// ✅ Definir tipos explícitos
interface Enrollment {
  id: string
  completed_at: string | null
}

interface UserWithStats {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  avatar_url?: string | null
  enrollments: Enrollment[]
}

export default async function AdminUsersPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/dashboard")
  }

  // ✅ OPTIMIZACIÓN: Una sola query con JOIN para traer usuarios con sus stats
  const { data: usersWithStats } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      role,
      created_at,
      avatar_url,
      enrollments:user_course_progress(
        id,
        completed_at
      )
    `)
    .order("created_at", { ascending: false })
    .returns<UserWithStats[]>()

  // ✅ Procesar stats en memoria (mucho más rápido que queries individuales)
  const processedUsers = (usersWithStats || []).map(user => ({
    ...user,
    enrollmentCount: user.enrollments?.length || 0,
    completedCount: user.enrollments?.filter(e => e.completed_at).length || 0,
  }))

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case "admin":
        return "default"
      case "instructor":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "instructor":
        return "Instructor"
      default:
        return "Estudiante"
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader profile={profile} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
                <p className="text-muted-foreground mt-1">Administra los usuarios de la plataforma</p>
              </div>
              <Link href="/admin/users/new">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Usuario
                </Button>
              </Link>
            </div>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Todos los Usuarios ({processedUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processedUsers.map((user) => {
                    const initials = user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <div key={user.id} className="flex items-center justify-between py-4 border-b last:border-0">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{user.full_name}</p>
                              <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{user.enrollmentCount}</p>
                            <p className="text-xs text-muted-foreground">Inscritos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{user.completedCount}</p>
                            <p className="text-xs text-muted-foreground">Completados</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Registrado:{" "}
                              {new Date(user.created_at).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}