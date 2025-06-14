import { BookOpen, BrainCircuit, Repeat, UserPlus } from "lucide-react";
import AuthButton from "./header-auth";

const features = [
  {
    icon: BrainCircuit,
    title: "Generowanie fiszek z AI",
    description:
      "Wklej tekst, a sztuczna inteligencja automatycznie stworzy dla Ciebie fiszki (pytanie i odpowiedź).",
  },
  {
    icon: BookOpen,
    title: "Zarządzanie taliami",
    description:
      "Organizuj swoje fiszki w talie tematyczne dla lepszej kategoryzacji i nauki.",
  },
  {
    icon: Repeat,
    title: "Inteligentne powtórki (SRS)",
    description:
      "Wbudowany algorytm Spaced Repetition System (SRS) ułatwia efektywną naukę poprzez zaplanowane sesje powtórek.",
  },
  {
    icon: UserPlus,
    title: "Zarządzanie kontem",
    description:
      "Rejestracja i logowanie umożliwiają bezpieczne przechowywanie fiszek i śledzenie postępów w nauce.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="w-full flex flex-col items-center relative"
      data-testid="landing-page"
    >
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>
      <section className="text-center py-12 md:py-24 max-w-5xl">
        <h1
          className="text-4xl md:text-6xl font-bold tracking-tighter mb-4"
          data-testid="landing-title"
        >
          Inteligentne Fiszki
        </h1>
        <p
          className="max-w-2xl mx-auto text-lg text-foreground/80 mb-8"
          data-testid="landing-subtitle"
        >
          Twórz fiszki do nauki w mgnieniu oka z pomocą sztucznej inteligencji.
          Skup się na nauce, a nie na żmudnym przygotowywaniu materiałów.
        </p>
      </section>

      <section className="w-full py-16 bg-muted/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2
            className="text-3xl font-bold text-center mb-12"
            data-testid="features-title"
          >
            Odkryj kluczowe funkcje
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start space-x-4 p-4"
                  data-testid={`feature-card-${feature.title.replace(/\s+/g, "-")}`}
                >
                  <Icon className="w-12 h-12 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
