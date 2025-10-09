"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, Database } from "lucide-react"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("admin@empresa.com")
  const [password, setPassword] = useState("bejerman")
  const [fullName, setFullName] = useState("Administrador")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [needsSetup, setNeedsSetup] = useState(false)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    setNeedsSetup(false)

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsSetup) {
          setNeedsSetup(true)
        }
        throw new Error(data.error || "Error al crear el administrador")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Administrador Creado</CardTitle>
            <CardDescription>El usuario administrador ha sido creado exitosamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Credenciales de acceso:</p>
              <p className="text-sm text-muted-foreground">Email: {email}</p>
              <p className="text-sm text-muted-foreground">Password: {password}</p>
            </div>
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-1">Último paso importante:</p>
                <p className="text-sm">
                  Ejecuta el script{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">scripts/003_fix_rls_and_create_admin_profile.sql</code>{" "}
                  para crear tu perfil en la base de datos.
                </p>
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <a href="/login">Ir al Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuración Inicial</CardTitle>
          <CardDescription>Crea el primer usuario administrador del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {needsSetup && (
            <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
              <Database className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                <p className="font-semibold mb-2">Base de datos no configurada</p>
                <p className="text-sm mb-2">Debes ejecutar primero los scripts SQL en orden:</p>
                <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
                  <li>scripts/001_create_tables.sql</li>
                  <li>scripts/002_seed_data.sql</li>
                  <li>scripts/003_fix_rls_and_create_admin_profile.sql</li>
                </ol>
                <p className="text-sm mt-2">
                  Puedes ejecutarlos desde el panel de v0 o desde tu dashboard de Supabase.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {error && !needsSetup && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Administrador
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
