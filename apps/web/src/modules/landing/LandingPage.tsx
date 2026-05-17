import { ArrowRight, BellRing, Building2, CheckCircle2, GraduationCap, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type PublicStats = {
  students: number;
  activeAlerts: number;
  institutions: number;
  municipalities: number;
};

async function getStats(): Promise<PublicStats> {
  try {
    const response = await fetch(`${API_URL}/api/public/stats`, { next: { revalidate: 60 } });
    if (!response.ok) return { students: 0, activeAlerts: 0, institutions: 0, municipalities: 0 };
    return response.json() as Promise<PublicStats>;
  } catch {
    return { students: 0, activeAlerts: 0, institutions: 0, municipalities: 0 };
  }
}

export async function LandingPage() {
  const stats = await getStats();

  return (
    <main className="bg-background">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            EduAlerta
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Publica">
            <a href="#beneficios" className="hover:text-foreground">
              Beneficios
            </a>
            <a href="#roles" className="hover:text-foreground">
              Roles
            </a>
            <a href="#seguridad" className="hover:text-foreground">
              Seguridad
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
            <Button asChild>
              <Link href={"/activate-account" as Route}>Activar cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-medium text-primary">Permanencia escolar basada en alertas tempranas</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-foreground">
            Una plataforma institucional para anticipar desercion y repitencia.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            EduAlerta conecta docentes, directivos, acudientes y secretarias de educacion en un flujo trazable para registrar alertas, priorizar riesgo y coordinar seguimiento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login">
                Entrar a la plataforma
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={"/register" as Route}>Solicitar acceso institucional</Link>
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric value={stats.students} label="Estudiantes" />
            <Metric value={stats.activeAlerts} label="Alertas activas" />
            <Metric value={stats.institutions} label="Instituciones" />
            <Metric value={stats.municipalities} label="Municipios" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <p className="text-sm font-semibold">Vista territorial en tiempo real</p>
            <p className="text-xs text-muted-foreground">Datos conectados a PostgreSQL mediante NestJS y Prisma</p>
          </div>
          <div className="grid gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <PanelStat icon={Users} label="Riesgo alto" value={stats.activeAlerts} />
              <PanelStat icon={Building2} label="Conectadas" value={stats.institutions} />
              <PanelStat icon={BellRing} label="Municipios" value={stats.municipalities} />
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-md border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Seguimiento semanal</span>
                  <span className="text-xs text-muted-foreground">Sabana Centro</span>
                </div>
                <div className="flex h-44 items-end gap-2">
                  <span className="h-16 flex-1 rounded-t bg-primary/20" />
                  <span className="h-24 flex-1 rounded-t bg-primary/40" />
                  <span className="h-20 flex-1 rounded-t bg-primary/30" />
                  <span className="h-32 flex-1 rounded-t bg-primary/60" />
                  <span className="h-28 flex-1 rounded-t bg-primary/50" />
                  <span className="h-40 flex-1 rounded-t bg-primary" />
                </div>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium">Flujo de accion</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Step text="Docente registra alerta" />
                  <Step text="Coordinacion prioriza caso" />
                  <Step text="Acudiente recibe seguimiento" />
                  <Step text="Secretaria monitorea territorio" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-y bg-card py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          <Feature icon={BellRing} title="Alertas accionables" text="Registro docente, priorizacion y trazabilidad para intervenir antes de que el riesgo escale." />
          <Feature icon={ShieldCheck} title="RBAC institucional" text="Permisos por rol para proteger informacion sensible de estudiantes y familias." />
          <Feature icon={Building2} title="Gestion multiinstitucion" text="Lectura por colegio, municipio y secretaria para decisiones de politica educativa." />
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-4 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-normal">Una experiencia distinta para cada actor educativo</h2>
          <p className="mt-3 text-muted-foreground">Cada rol entra a un panel propio, con navegacion, permisos y acciones alineadas a su responsabilidad.</p>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <Role title="Docentes" text="Alertas, estudiantes, asistencia y seguimiento de aula." />
          <Role title="Directivos" text="Riesgo institucional, casos activos y gestion de equipos." />
          <Role title="Secretarias" text="Monitoreo territorial, instituciones y reportes agregados." />
        </div>
      </section>

      <footer id="seguridad" className="border-t bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>EduAlerta. Plataforma SaaS educativa para permanencia escolar.</p>
          <p>JWT, RBAC, auditoria y sesiones persistidas.</p>
        </div>
      </footer>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-2xl font-semibold">{value.toLocaleString("es-CO")}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function PanelStat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="rounded-md border p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-xl font-semibold">{value.toLocaleString("es-CO")}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-primary" />
      <span>{text}</span>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof BellRing; title: string; text: string }) {
  return (
    <article className="rounded-lg border bg-background p-5">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}

function Role({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}
