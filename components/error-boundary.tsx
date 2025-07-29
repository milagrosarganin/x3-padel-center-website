"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null)

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true)
      setError(event.error)
      setErrorInfo({ componentStack: "Unhandled error" }) // Basic info for unhandled errors
      console.error("Unhandled Error:", event.error, event)
    }

    const promiseRejectionHandler = (event: PromiseRejectionEvent) => {
      setHasError(true)
      setError(new Error(event.reason))
      setErrorInfo({ componentStack: "Unhandled promise rejection" }) // Basic info for unhandled rejections
      console.error("Unhandled Promise Rejection:", event.reason, event)
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", promiseRejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", promiseRejectionHandler)
    }
  }, [])

  // This method is for React component errors (e.g., in render phase)
  // It's a static method, so it doesn't have access to `this`
  // We simulate its behavior with useState and useEffect
  const componentDidCatch = (error: Error, errorInfo: React.ErrorInfo) => {
    setHasError(true)
    setError(error)
    setErrorInfo(errorInfo)
    console.error("React Error Boundary Caught:", error, errorInfo)
  }

  if (hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 dark:bg-red-950 p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">¡Algo salió mal!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Lo sentimos, ha ocurrido un error inesperado en la aplicación.
            </p>
            {error && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-left text-sm font-mono overflow-auto max-h-60">
                <p className="font-bold text-gray-800 dark:text-gray-200">Error:</p>
                <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">{error.message}</pre>
                {errorInfo?.componentStack && (
                  <>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-2">Component Stack:</p>
                    <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
            <Button onClick={() => window.location.reload()} className="mt-4">
              Recargar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
