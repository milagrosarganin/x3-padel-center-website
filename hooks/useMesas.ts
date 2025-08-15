// hooks/use-mesas.ts
"use client";
import { useCallback, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export type Mesa = {
  id: string;
  nombre: string;
  estado: "abierta" | "cerrada";
  user_id: string;
  created_at: string;
};

export function useMesas() {
  const { user } = useAuth();
  const userId = user?.id;
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMesas = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("mesas")
        .select("*")
        .eq("user_id", userId)
        .order("nombre", { ascending: true });

      if (fetchError) throw fetchError;
      setMesas(data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchMesas();
    }
  }, [userId, fetchMesas]);

  const crearMesa = useCallback(async (nombre: string) => {
    if (!userId) throw new Error("Falta userId para crear mesa");
    setLoading(true);
    const { error } = await supabase.from("mesas").insert({ nombre, user_id: userId, estado: "cerrada" });
    if (error) setError(error);
    else await fetchMesas();
    setLoading(false);
  }, [userId, fetchMesas]);

  const renombrarMesa = useCallback(async (id: string, nuevoNombre: string) => {
    setLoading(true);
    const { error } = await supabase.from("mesas").update({ nombre: nuevoNombre }).eq("id", id);
    if (error) setError(error);
    else await fetchMesas();
    setLoading(false);
  }, [fetchMesas]);

  const cambiarEstadoMesa = useCallback(async (id: string, nuevoEstado: "abierta" | "cerrada") => {
    setLoading(true);
    const { error } = await supabase.from("mesas").update({ estado: nuevoEstado }).eq("id", id);
    if (error) setError(error);
    else await fetchMesas();
    setLoading(false);
  }, [fetchMesas]);

  const borrarMesa = useCallback(async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("mesas").delete().eq("id", id);
    if (error) setError(error);
    else await fetchMesas();
    setLoading(false);
  }, [fetchMesas]);

  return {
    mesas,
    loading,
    error,
    crearMesa,
    renombrarMesa,
    cambiarEstadoMesa,
    borrarMesa,
  };
}
