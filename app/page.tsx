import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">Academia Corporativa</h1>
              <p className="text-xs text-muted-foreground">Plataforma de Capacitación</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-6xl font-bold text-balance text-foreground">Plataforma de Capacitación Interna</h2>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            Accede con tus credenciales para comenzar tu capacitación
          </p>
          <div className="pt-6">
            <Link href="/login">
              <Button size="lg" className="text-lg px-12 py-6">
                Acceder a la Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Academia Corporativa. Plataforma de Capacitación Interna.</p>
        </div>
      </footer>
    </div>
  )
}
