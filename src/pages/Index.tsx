import React, { useState, useEffect } from "react";
import InstaEmbed from "@/components/InstaEmbed";

const STRIPE_URL = "https://buy.stripe.com/5kQdRb8cbglMf7E7dSdQQ00";

const INSTAGRAM_REELS: string[] = [
  "https://www.instagram.com/reel/DJmUkiNsZe1/",
  "https://www.instagram.com/reel/DJSHB73ogs1/",
  "https://www.instagram.com/reel/DJjUiEnM-A_/",
  "https://www.instagram.com/reel/DJoAXfKs6tu/",
  "https://www.instagram.com/reel/DFX57cQobmS/"
];

function useCountdown(hours = 12) {
  const [end] = useState(() => Date.now() + hours * 3600 * 1000);
  const [left, setLeft] = useState(end - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(id);
  }, [end]);
  const total = Math.max(0, left);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { h, m, s, finished: total <= 0 };
}

function SectionMarker({ n }: { n: string }) {
  return (
    <div className="section-marker" aria-hidden="true">
      <span className="marker-number">{n}</span>
      <span className="marker-line" />
      <style>{`
        .section-marker {
          position: absolute;
          left: 1rem;
          top: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 10;
          opacity: 0;
          transform: translateY(10px);
          animation: marker-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.2s;
        }
        @media (min-width: 1024px) {
          .section-marker {
            left: 0;
            top: 0.5rem;
            transform: translate(-60px, 0);
          }
        }
        .marker-number {
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.15em;
          color: rgba(148, 163, 184, 0.7);
          font-variant-numeric: tabular-nums;
        }
        @media (min-width: 1024px) {
          .marker-number {
            font-size: 16px;
          }
        }
        .marker-line {
          width: 28px;
          height: 1.5px;
          background: linear-gradient(90deg, rgba(148, 163, 184, 0.4) 0%, transparent 100%);
        }
        @media (min-width: 1024px) {
          .marker-line {
            width: 40px;
          }
        }
        @keyframes marker-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function ReviewLightbox({ isOpen, onClose, imageSrc, reviewNumber }: { isOpen: boolean; onClose: () => void; imageSrc: string; reviewNumber: number }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="max-w-2xl max-h-[90vh] relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 transition-colors w-10 h-10 flex items-center justify-center"
          aria-label="Закрыть"
        >
          ✕
        </button>
        <img src={imageSrc} alt={`Отзыв ${reviewNumber}`} className="w-full h-auto rounded-2xl shadow-2xl" />
      </div>
    </div>
  );
}

function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
    </div>
  );
}

function HighlightedDesc({ text, primaryHighlight, extraPhrases = [] }: { text: string; primaryHighlight?: string; extraPhrases?: string[] }) {
  const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escapeHtml(text);
  if (primaryHighlight) {
    const ph = escapeHtml(primaryHighlight);
    html = html.replace(
      new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      `<span class="text-blue-600 font-semibold">${ph}</span>`
    );
  }
  for (const phrase of extraPhrases) {
    const p = escapeHtml(phrase);
    html = html.replace(
      new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      `<span class="text-blue-600 font-semibold">${p}</span>`
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewersCount, setViewersCount] = useState(12);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxReviewNumber, setLightboxReviewNumber] = useState(1);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  const { h, m, s, finished } = useCountdown(12);

  useEffect(() => {
    const id = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const next = prev + change;
        return Math.max(8, Math.min(18, next));
      });
    }, 6000 + Math.random() * 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setShowStickyCTA(scrolled > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openLightbox = (imageSrc: string, reviewNumber: number) => {
    setLightboxImage(imageSrc);
    setLightboxReviewNumber(reviewNumber);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll<HTMLElement>(".fade-in-view").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ReviewLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={lightboxImage}
        reviewNumber={lightboxReviewNumber}
      />

      <ScrollProgress />

      {/* Viewers Badge - Desktop Only */}
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-white/95 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="font-medium tabular-nums">{viewersCount} онлайн</span>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl z-50 border-b border-gray-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Beauty Scripts</div>
          <a
            href={STRIPE_URL}
            target="_blank"
            rel="noopener"
            className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-800 transition-all hover:scale-105 transform hover:shadow-xl min-h-[44px] flex items-center justify-center"
            aria-label="Купить скрипты"
          >
            Купить
          </a>
        </div>
      </header>

      {/* HERO SECTION - Improved mobile photo display */}
      <section className="relative min-h-screen flex items-center pt-20 sm:pt-24 pb-12 hero-section">
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-white/50 md:from-white/95 md:via-white/80 md:to-transparent pointer-events-none z-[1]"></div>

        {/* Mobile: Real image to prevent cropping */}
        <img
          src="/images/IMG_6537.jpeg"
          alt="Beauty professional"
          className="hero-photo md:hidden"
          loading="eager"
          decoding="async"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl fade-in-view">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mb-5 sm:mb-6 text-gray-900 animate-fade-in-up">
              Скрипты, которые превращают{" "}
              <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">сообщения в деньги</span>
            </h1>

            <div className="result-subtitle mb-5 sm:mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-gray-800">
                Проверенная система общения с клиентами для бьюти-мастеров
              </p>
            </div>

          <p
  className="text-base sm:text-lg lg:text-xl text-gray-800 mb-8 sm:mb-10 leading-relaxed animate-fade-in-up"
  style={{ animationDelay: "0.2s" }}
>
  <span className="font-semibold uppercase tracking-wide text-blue-600 drop-shadow-sm">
    РЕЗУЛЬТАТ:
  </span>{" "}
  закрытые возражения, увеличенный средний чек, экономия времени
</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <a
                href={STRIPE_URL}
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-3 px-7 sm:px-8 lg:px-9 py-4 sm:py-4.5 lg:py-5 bg-gray-900 text-white rounded-2xl text-lg sm:text-xl font-bold hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-2xl min-h-[56px] relative overflow-hidden"
                aria-label="Купить скрипты за 19 евро"
              >
                <span className="relative z-10">Купить</span>
                <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">→</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <div className="hidden sm:flex items-center gap-2.5 text-sm">
                <span className="px-3 py-1.5 bg-black text-white rounded-lg font-medium">Apple Pay</span>
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium">Google Pay</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-600 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/70 flex items-center gap-1.5">
                <span>🔒</span> Безопасная оплата
              </span>
              <span className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/70 flex items-center gap-1.5">
                <span>✓</span> Stripe
              </span>
            </div>
          </div>
        </div>

        <style>{`
          .hero-section {
            background-image: url('/images/IMG_6537.jpeg');
            background-repeat: no-repeat;
            background-size: cover;
            background-position: right center;
            background-color: #f5f7fa;
          }
          
          /* Mobile: No background, use real <img> instead */
          @media (max-width: 767px) {
            .hero-section {
              background-image: none;
              background-color: #f8f9fb;
            }
          }
          
          /* Tablet */
          @media (min-width: 768px) and (max-width: 1023px) {
            .hero-section {
              background-size: 65%;
              background-position: 108% center;
            }
          }
          
          /* Desktop: Person on right with more breathing room */
          @media (min-width: 1024px) {
            .hero-section {
              background-size: 70%;
              background-position: 115% center;
            }
          }

          /* MOBILE PHOTO - Full display without cropping */
          .hero-photo {
            position: absolute;
            right: -3%;
            bottom: 0;
            height: 75vh;
            max-height: 75dvh;
            width: auto;
            object-fit: contain;
            object-position: bottom right;
            pointer-events: none;
            z-index: 0;
          }

          .result-subtitle {
            position: relative;
            padding-top: 14px;
            margin-top: 10px;
          }
          
          .result-subtitle::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 72px;
            height: 3px;
            background: linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, transparent 100%);
            border-radius: 2px;
          }
        `}</style>
      </section>

      {/* 01 - Comparison Section */}
      <section id="comparison" className="relative py-16 sm:py-20 lg:py-24 section-bg-1">
        <SectionMarker n="01" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-in-view">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Как изменится ваша <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">работа с клиентами</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Сравните результаты до и после внедрения скриптов
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="card-premium bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 fade-in-view">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-red-50 text-red-600 rounded-full font-semibold text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Сейчас
                </div>
              </div>
              <ul className="space-y-4 text-base lg:text-lg text-gray-800">
                {[
                  "«Сколько стоит?» → Отвечаете только ценой и тишина.",
                  "«Подумаю» → Не знаете, что ответить: клиент уходит.",
                  "«Переписка 30+ минут» → Клиент остывает, теряете заявку.",
                  "«10 заявок» → Долгие диалоги приводят только к 2–3 записям.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 hover:bg-red-50/50 p-3 rounded-xl transition-all duration-300">
                    <svg className="w-6 h-6 mt-0.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-premium bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 fade-in-view" style={{ animationDelay: "0.1s" }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-green-50 text-green-600 rounded-full font-semibold text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  После
                </div>
              </div>
              <ul className="space-y-4 text-base lg:text-lg text-gray-800">
                {[
                  "«Сколько стоит?» → Презентуете ценность, получаете запись.",
                  "«Подумаю» → Мягкое возражение возвращает к записи.",
                  "«Переписка 5 минут» → Готовые фразы ведут к быстрой записи.",
                  "«10 заявок» → Чёткие диалоги дают 6–7 записей.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 hover:bg-green-50/50 p-3 rounded-xl transition-all duration-300">
                    <svg className="w-6 h-6 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 02 - Why Section */}
      <section id="why" className="relative py-16 sm:py-20 lg:py-24 section-bg-2">
        <SectionMarker n="02" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-in-view">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Почему это <span className="text-rose-600">важно</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Каждая потерянная заявка — это упущенная прибыль
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { img: "/images/money.png", title: "Сливаются деньги на рекламу", text: "Платите за заявки, но конвертируете лишь 20–30%. Остальные — выброшенный бюджет." },
              { img: "/images/clock.png", title: "Тратится время впустую", text: "По 30–40 минут на переписку с каждым. Уходит 3–4 часа в день." },
              { img: "/images/door.png", title: "Заявки уходят к конкуренту", text: "Пока вы думаете, клиент записывается к тем, кто отвечает быстро и уверенно." },
            ].map((c, i) => (
              <div key={i} className="card-premium rounded-3xl border border-gray-100 p-7 text-center bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group fade-in-view" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:scale-110 transition-transform duration-300">
                  <img src={c.img} alt="" className="w-10 h-10 object-contain" loading="lazy" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 - For Whom Section */}
      <section id="for" className="relative py-16 sm:py-20 lg:py-24 section-bg-1">
        <SectionMarker n="03" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 fade-in-view">
            Кому подходят <span className="text-emerald-600">скрипты</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {[
              { img: "/images/salon.png", title: "Владельцам салонов и студий", text: "Стандарт ответов, скорость и контроль: все отвечают одинаково сильно." },
              { img: "/images/med.png", title: "Медицинским центрам", text: "Админы закрывают заявки, врачи работают с реальными пациентами." },
              { img: "/images/team.png", title: "Мастерам-универсалам", text: "Ответы на типовые ситуации ведут быстрее к записи, увереннее в чате." },
              { img: "/images/one.png", title: "Узким специалистам", text: "Ногти, брови, ресницы, волосы, косметология, перманент. Блоки под услугу." },
            ].map((c, i) => (
              <div
                key={i}
                className="card-premium bg-white rounded-3xl p-7 border border-emerald-100/50 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 fade-in-view"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                    <img src={c.img} alt="" className="w-9 h-9 object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{c.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 - What's Included Section */}
      <section id="whats-included" className="relative py-16 sm:py-20 lg:py-24 section-bg-2">
        <SectionMarker n="04" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-in-view">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Что входит в <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">систему скриптов</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Полный набор инструментов для увеличения продаж</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { img: "/images/xmind.png", title: "Готовые диалоги", desc: "Контакты до оплаты: приветствия, презентация ценности, запись. Всё пошагово.", highlight: "презентация ценности" },
              { img: "/images/target.png", title: "Закрытие возражений", desc: "«Дорого», «Подумаю», «У другого дешевле». Мягкие ответы без давления.", highlight: "мягкие ответы без давления" },
              { img: "/images/salons.png", title: "Под каждую услугу", desc: "Маникюр, брови, ресницы, косметология, массаж. Учтена специфика каждой ниши.", highlight: "учтена специфика каждой ниши" },
              { img: "/images/bucle.png", title: "Возврат клиентов", desc: "Сценарии повторных записей и реактивации «спящей» базы без рекламы.", highlight: "реактивации «спящей» базы без рекламы" },
              { img: "/images/phone.png", title: "Гайд по внедрению", desc: "Старт за один день: пошаговый план и стандарты для команды.", highlight: "Старт за один день" },
              { img: "/images/rocket.png", title: "Итог", desc: "Больше записей, выше средний чек, меньше времени в переписке.", highlight: "выше средний чек", big: true },
            ].map((item, k) => (
              <div key={k} className="card-premium rounded-3xl border border-gray-100 p-6 sm:p-7 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group fade-in-view" style={{ animationDelay: `${k * 0.08}s` }}>
                <div className="mb-4 inline-flex items-center justify-center">
                  <img
                    src={item.img}
                    alt=""
                    className={`${item.big ? "w-16 h-16" : "w-14 h-14"} object-contain group-hover:scale-110 transition-transform duration-300`}
                    loading="lazy"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <HighlightedDesc text={item.desc} primaryHighlight={item.highlight} extraPhrases={["без давления", "каждой ниши"]} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 - Bonuses Section */}
      <section id="bonuses" className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-purple-50/50 via-pink-50/30 to-white overflow-hidden">
        <SectionMarker n="05" />

        {/* Confetti decoration */}
        <div className="confetti-container">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12 fade-in-view">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Бонусы</span> при покупке
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Суммарная ценность — 79€. Сегодня идут бесплатно со скриптами
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { image: "/images/bonus1.png", title: "Гайд «Работа с клиентской базой»", desc: "Повторные записи без рекламы → возвращайте старых клиентов.", old: "27€" },
              { image: "/images/bonus2.png", title: "Чек-лист «30+ источников клиентов»", desc: "Платные и бесплатные способы → где взять заявки уже сегодня.", old: "32€" },
              { image: "/images/bonus3.png", title: "Гайд «Продажи на консультации»", desc: "5 этапов продаж → мягкий апсейл дополнительных услуг.", old: "20€" },
            ].map((b, i) => (
              <div key={i} className="card-premium rounded-3xl p-7 text-center bg-white shadow-md border border-purple-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 fade-in-view" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-5">
                  <img src={b.image} alt={`Бонус ${i + 1}`} className="w-32 h-44 sm:w-36 sm:h-48 mx-auto object-cover rounded-xl shadow-md" loading="lazy" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{b.desc}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-base font-bold text-gray-400 line-through">{b.old}</span>
                  <span className="text-xl font-bold text-green-600">0€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .confetti-container {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
          }
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            opacity: 0;
            background: linear-gradient(45deg, #b197fc 0%, #a29bfe 100%);
            animation: confetti-fall linear infinite;
            border-radius: 2px;
          }
          .confetti:nth-child(2n) {
            background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
          }
          .confetti:nth-child(3n) {
            background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
          }
          .confetti:nth-child(4n) {
            background: linear-gradient(45deg, #43e97b 0%, #38f9d7 100%);
          }
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </section>

      {/* 06 - Immediate Results Section */}
      <section id="immediate" className="relative py-16 sm:py-20 lg:py-24 section-bg-1">
        <SectionMarker n="06" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-in-view">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 inline-block">
              Что изменится <span className="text-teal-600">сразу</span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-32 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-400 rounded-full"></div>
          </div>

          <div className="space-y-5">
            {[
              "Перестанешь терять заявки из-за слабых ответов.",
              "Начнёшь закрывать больше записей уже с первого дня.",
              "Повысишь средний чек через правильные предложения.",
              "Станешь увереннее — на всё есть готовый ответ.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-teal-100/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group fade-in-view" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 - Reviews Section */}
      <section id="reviews" className="relative py-16 sm:py-20 lg:py-24 section-bg-2">
        <SectionMarker n="07" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 fade-in-view">
            Отзывы клиентов
          </h2>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-12 max-w-4xl mx-auto">
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                className="group cursor-pointer rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-view"
                style={{ animationDelay: `${n * 0.06}s` }}
                onClick={() => openLightbox(`/images/reviews/review${n}.png`, n)}
                aria-label={`Открыть отзыв ${n}`}
              >
                <img
                  src={`/images/reviews/review${n}.png`}
                  alt={`Отзыв ${n}`}
                  className="w-full h-40 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Instagram Reels */}
          <div className="flex gap-3 sm:gap-5 justify-center items-center overflow-x-auto pb-2 reels-container">
            {INSTAGRAM_REELS.slice(0, 3).map((url, idx) => (
              <div
                key={url}
                className={`${idx === 1 ? 'reel-card-featured' : 'reel-card-small'
                  } rounded-2xl overflow-hidden border-2 ${idx === 1 ? 'border-blue-400 shadow-xl' : 'border-gray-200'
                  } flex-shrink-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 fade-in-view`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <InstaEmbed url={url} maxWidth={idx === 1 ? 280 : 220} />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .reels-container {
            max-width: 100%;
            scroll-snap-type: x mandatory;
          }
          .reels-container > * {
            scroll-snap-align: center;
          }

          .reel-card-small {
            width: 150px;
            height: 267px;
          }
          .reel-card-featured {
            width: 190px;
            height: 338px;
          }

          @media (min-width: 640px) {
            .reel-card-small {
              width: 210px;
              height: 373px;
            }
            .reel-card-featured {
              width: 270px;
              height: 480px;
            }
          }
          @media (min-width: 1024px) {
            .reel-card-small {
              width: 220px;
              height: 391px;
            }
            .reel-card-featured {
              width: 280px;
              height: 500px;
            }
          }

          .reel-card-small :global(iframe),
          .reel-card-featured :global(iframe) {
            width: 100% !important;
            height: 100% !important;
            display: block;
            border: none;
          }
        `}</style>
      </section>

      {/* 08 - Offer Section */}
      <section id="offer" className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <SectionMarker n="08" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-in-view">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Полная система со скидкой <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">85%</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Специальное предложение на этой неделе • Предложение действует ограниченное время
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] fade-in-view">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-y-16 -translate-x-16" />

              <div className="relative z-10 text-center">
                <div className="text-sm uppercase tracking-wide text-gray-300 mb-4">Полный доступ</div>

                <div className="flex items-center justify-center gap-4 mb-5">
                  <span className="text-gray-400 line-through text-2xl sm:text-3xl font-bold">127€</span>
                  <span className="text-5xl sm:text-6xl font-extrabold text-white">19€</span>
                </div>

                <div className="mb-6">
                  <div className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
                    <span className="text-white text-lg">⏰</span>
                    {!finished ? (
                      <>
                        <span className="text-white text-sm font-medium">До конца:</span>
                        <span className="font-bold tabular-nums text-white text-base">
                          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-white text-sm">Время истекло</span>
                    )}
                  </div>
                </div>

                <a
                  href={STRIPE_URL}
                  target="_blank"
                  rel="noopener"
                  className="block w-full text-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-5 px-6 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl mb-5 min-h-[56px] relative overflow-hidden group"
                  aria-label="Купить полную систему со скидкой 85% — 19 евро"
                >
                  <span className="relative z-10">Получить со скидкой 85%</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>

                <div className="text-sm text-gray-300 mb-8">
                  Без скрытых платежей • Пожизненный доступ • Обновления включены
                </div>

                <div className="text-left mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">Что входит:</h3>
                  <ul className="space-y-3 text-sm text-gray-200">
                    {[
                      "Готовые диалоги для всех ситуаций",
                      "Шаблоны под конкретную услугу",
                      "Бонус: гайд по работе с базой (27€)",
                      "Бонус: 30+ источников клиентов (32€)",
                      "Бонус: продажи на консультации (20€)",
                      "Пожизненный доступ и обновления",
                    ].map((t, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0 font-bold">✓</span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                  <div className="px-3 py-1.5 bg-black text-white rounded-lg font-medium">Apple Pay</div>
                  <div className="px-3 py-1.5 bg-white/20 text-white rounded-lg font-medium">Google Pay</div>
                  <div className="px-3 py-1.5 bg-white/20 text-white rounded-lg font-medium">Visa</div>
                  <div className="px-3 py-1.5 bg-white/20 text-white rounded-lg font-medium">MasterCard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 - FAQ Section */}
      <section id="faq" className="relative py-16 sm:py-20 lg:py-24 section-bg-1">
        <SectionMarker n="09" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 fade-in-view">
            Частые вопросы
          </h2>

          <div className="space-y-4">
            {[
              { q: "Сработает в моей нише?", a: "Да. База универсальная и блоки под ногти/бровы/ресницы/волосы/косметологию/перманент." },
              { q: "Не будет ли звучать «по-скриптовому»?", a: "Нет. Формулировки живые, адаптируешь под свой тон. Главное — следовать алгоритму." },
              { q: "Зачем это админам?", a: "Единый стандарт повышает конверсию, скорость и управляемость. Новички включаются быстрее." },
              { q: "Когда будут результаты?", a: "Часто в первые 24 часа: готовые фразы экономят время и быстрее ведут к записи." },
            ].map((f, i) => (
              <div key={i} className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1 fade-in-view" style={{ animationDelay: `${i * 0.08}s` }}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-7 lg:px-9 py-6 text-left hover:bg-gray-50/50 flex justify-between items-center transition-colors min-h-[56px] group"
                  aria-label={`Вопрос: ${f.q}`}
                >
                  <span className="font-bold text-base lg:text-lg text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">{f.q}</span>
                  <span className={`w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-7 lg:px-9 py-6 border-t border-gray-100 bg-gray-50/30 animate-fade-in">
                    <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 bg-white border-t border-gray-200 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-2xl font-bold text-gray-900 mb-4">Beauty Scripts</div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Все права защищены</p>
        </div>
      </footer>

      {/* Sticky CTA - Mobile Only */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 z-50 lg:hidden shadow-2xl animate-slide-in-right">
          <a
            href={STRIPE_URL}
            target="_blank"
            rel="noopener"
            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-5 rounded-2xl font-bold text-base text-center block hover:from-gray-800 hover:to-gray-700 transition-all flex items-center justify-between min-h-[56px] shadow-lg"
            aria-label="Купить скрипты за 19 евро"
          >
            <span>Скрипты — 19€</span>
            <span className="text-xl">→</span>
          </a>
        </div>
      )}

      <style>{`
        /* Premium gradients for sections */
        .section-bg-1 {
          background: linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%);
        }
        .section-bg-2 {
          background: linear-gradient(180deg, #f8f9fb 0%, #e8ecf1 50%, #ffffff 100%);
        }

        /* Premium card effect */
        .card-premium {
          position: relative;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-premium::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s;
        }
        .card-premium:hover::before {
          opacity: 1;
        }

        /* Intersection Observer animation */
        .fade-in-view {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-in-view.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
