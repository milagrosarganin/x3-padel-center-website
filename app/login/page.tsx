"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Lock, User, Mail } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    nombre: "",
    nombreNegocio: "", // Nuevo campo para el nombre del negocio
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { user, loading, signIn, signUp } = useAuth()
  const router = useRouter()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && !loading) {
      router.push("/")
    }
  }, [user, loading, router])

  const validateLogin = () => {
    const newErrors: Record<string, string> = {}

    if (!loginData.email) newErrors.email = "El email es obligatorio"
    if (!loginData.password) newErrors.password = "La contraseña es obligatoria"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegister = () => {
    const newErrors: Record<string, string> = {}

    if (!registerData.nombre) newErrors.nombre = "El nombre es obligatorio"
    if (!registerData.nombreNegocio) newErrors.nombreNegocio = "El nombre del negocio es obligatorio"
    if (!registerData.email) newErrors.email = "El email es obligatorio"
    if (!registerData.password) newErrors.password = "La contraseña es obligatoria"
    if (registerData.password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return

    await signIn(loginData.email, loginData.password)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return

    const success = await signUp(
      registerData.email,
      registerData.password,
      registerData.nombre,
      registerData.nombreNegocio,
    )
    if (success) {
      // Limpiar formulario
      setRegisterData({
        nombre: "",
        nombreNegocio: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return null // Se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/x3-logo.png" alt="X3 Padel Center" width={200} height={80} className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">X3 Padel Center</CardTitle>
          <p className="text-muted-foreground">Sistema de gestión</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="tu@email.com"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Tu contraseña"
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      type="text"
                      value={registerData.nombre}
                      onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                      placeholder="Tu nombre completo"
                      className={`pl-10 ${errors.nombre ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreNegocio">Nombre del Negocio</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />{" "}
                    {/* Usar un icono más apropiado si hay */}
                    <Input
                      id="nombreNegocio"
                      type="text"
                      value={registerData.nombreNegocio}
                      onChange={(e) => setRegisterData({ ...registerData, nombreNegocio: e.target.value })}
                      placeholder="Ej: X3 Padel Center"
                      className={`pl-10 ${errors.nombreNegocio ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {errors.nombreNegocio && <p className="text-sm text-red-500">{errors.nombreNegocio}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="registerEmail"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="tu@email.com"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="registerPassword"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="Confirma tu contraseña"
                      className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {loading ? "Registrando..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
