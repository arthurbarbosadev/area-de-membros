import { createSupabaseServerClient } from "@/lib/supabase/server";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  module: string | null;
  position: number;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .order("module", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const grouped = groupByModule((lessons ?? []) as Lesson[]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-up">
        <div>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-marine-mint" />
            Sua área LowDigital
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight mt-4">
            Suas aulas
          </h1>
          <p className="mt-2 text-white/60 max-w-xl">
            Conteúdo liberado para você. Assista no seu ritmo, sem prazo.
          </p>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card-glass p-10 mt-10 text-center animate-fade-up">
          <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-marine-deep/40 border border-marine/40">
            <svg
              className="h-6 w-6 text-marine-mint"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">
            Nada por aqui ainda
          </h2>
          <p className="mt-1 text-sm text-white/55">
            As aulas aparecem aqui assim que forem publicadas.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {grouped.map(({ module, items }) => (
            <section
              key={module}
              className="animate-fade-up"
              style={{ animationDelay: "60ms" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {module}
                </h2>
                <span className="chip">{items.length} aula{items.length > 1 ? "s" : ""}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <article className="card-glass overflow-hidden group transition hover:-translate-y-0.5">
      <div className="relative aspect-video bg-gradient-to-br from-navy-deep to-marine-deep overflow-hidden">
        {lesson.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <svg
              className="h-10 w-10 text-marine-mint/70"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-white leading-snug">
          {lesson.title}
        </h3>
        {lesson.description && (
          <p className="mt-2 text-sm text-white/60 leading-relaxed line-clamp-3">
            {lesson.description}
          </p>
        )}
        {lesson.video_url && (
          <a
            href={lesson.video_url}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost mt-5 w-full justify-center text-sm py-2"
          >
            Assistir
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}

function groupByModule(lessons: Lesson[]) {
  const map = new Map<string, Lesson[]>();
  for (const l of lessons) {
    const key = l.module?.trim() || "Geral";
    const arr = map.get(key) ?? [];
    arr.push(l);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([module, items]) => ({
    module,
    items,
  }));
}
