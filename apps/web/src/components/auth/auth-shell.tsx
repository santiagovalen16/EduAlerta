import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
  footer
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary)),transparent_32rem)]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            EduAlerta
          </Link>
          <div className="mt-16 max-w-xl">
            <p className="text-sm font-medium text-primary">Plataforma institucional de permanencia escolar</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground">
              Decisiones tempranas para proteger trayectorias educativas.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Coordina docentes, directivos, acudientes y secretarias de educacion con informacion trazable, segura y lista para baja conectividad.
            </p>
          </div>
        </section>
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground lg:hidden">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
          {footer ? <div className="mt-6 border-t pt-5 text-sm text-muted-foreground">{footer}</div> : null}
        </section>
      </div>
    </main>
  );
}
