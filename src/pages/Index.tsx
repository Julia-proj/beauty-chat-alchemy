import React, { useState, useEffect } from "react";

const STRIPE_URL = "https://buy.stripe.com/5kQdRb8cbglMf7E7dSdQQ00";

const INSTAGRAM_REELS: string[] = [
  "https://www.instagram.com/reel/DJmUkiNsZe1/",
  "https://www.instagram.com/reel/DJSHB73ogs1/",
  "https://www.instagram.com/reel/DJjUiEnM-A_/",
  "https://www.instagram.com/reel/DJoAXfKs6tu/",
  "https://www.instagram.com/reel/DFX57cQobmS/"
];

function InstaEmbed({ url, maxWidth = 280 }: { url: string; maxWidth?: number }) {
  const embedUrl = `${url}embed/`;
  
  return (
    <iframe
      src={embedUrl}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        overflow: 'hidden',
      }}
      scrolling="no"
      allowTransparency={true}
      allow="encrypted-media"
    />
  );
}

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
      <style jsx>{`
        .section-marker {
          position: absolute;
          left: 1rem;
          top: .75rem;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 10;
          opacity: 0;
          transform: translateY(8px);
          animation: marker-in .7s ease forwards;
          animation-delay: .15s;
        }
        @media (min-width:1024px){
          .section-marker{ left:0; top:.5rem; transform: translate(-60px, 0); }
        }
        .marker-number{ font-weight:700; font-size:13px; letter-spacing:.12em; color: rgba(148,163,184,.72); font-variant-numeric: tabular-nums; }
        @media (min-width:1024px){ .marker-number{ font-size:15px; } }
        .marker-line{ width:28px; height:1.5px; background: linear-gradient(90deg, rgba(148,163,184,.4) 0%, transparent 100%); }
        @media (min-width:1024px){ .marker-line{ width:40px; } }
        @keyframes marker-in{ from{opacity:0; transform: translateY(10px);} to{opacity:1; transform: translateY(0);} }
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
    <div className="min-h-screen bg-white overflow-x-hidden no-awkward-breaks">
      <ReviewLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={lightboxImage}
        reviewNumber={lightboxReviewNumber}
      />

      <ScrollProgress />

      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-white/95 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="font-medium tabular-nums">{viewersCount} онлайн</span>
        </div>
      </div>

      <header className="fixed top-0 left-0 right-0 bg-white/60 sm:bg-white/70 backdrop-blur-2xl z-50 border-b border-gray-200/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
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

      <section className="relative w-full min-h-screen flex items-start lg:items-center justify-start overflow-hidden pt-28 sm:pt-32 lg:pt-40 bg-[#f7f4f1]">
        <img
          src="/images/IMG_6537.jpeg"
          alt="Beauty professional"
          className="hero-image"
          loading="eager"
          decoding="async"
        />

        <div className="hero-overlay pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-xl lg:max-w-2xl fade-in-view">
            <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] mb-4 sm:mb-5 text-gray-900">
              Скрипты, которые превращают{" "}
              <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                сообщения в деньги
              </span>
            </h1>

            <div className="result-subtitle mb-4 sm:mb-5">
              <p className="text-pretty text-base sm:text-lg lg:text-xl font-semibold leading-relaxed text-gray-800">
                Проверенная система общения с клиентами для бьюти-мастеров
              </p>
            </div>

            <p className="text-pretty text-sm sm:text-base lg:text-lg text-gray-800 mb-7 sm:mb-8 leading-relaxed">
              <span className="font-semibold uppercase tracking-wide text-blue-600">
                РЕЗУЛЬТАТ:
              </span>{" "}
              закрытые возражения, увеличенный средний чек, экономия времени
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 mt-1">
              <a
                href={STRIPE_URL}
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-2.5 px-6 sm:px-7 lg:px-8 py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl text-base sm:text-lg font-bold hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-2xl min-h-[52px] relative overflow-hidden"
                aria-label="Купить скрипты за 19 евро"
              >
                <span className="relative z-10">Купить</span>
                <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">→</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <div className="hidden sm:flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="px-2.5 py-1.5 bg-black text-white rounded-lg font-medium">Apple Pay</span>
                <span className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-medium">Google Pay</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/60 flex items-center gap-1.5 whitespace-nowrap">
                <span>🔒</span> Безопасная оплата
              </span>
              <span className="px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/60 flex items-center gap-1.5">
                <span>✓</span> Stripe
              </span>
            </div>
          </div>
        </div>

        <style jsx>{`
          :global(html, body, #__next){ background:#f7f4f1; overscroll-behavior-y: contain; }
          :global(body){ -webkit-overflow-scrolling: touch; }

          :global(.no-awkward-breaks){ word-break: keep-all; hyphens: manual; }
          :global(.text-balance){ text-wrap: balance; }
          :global(.text-pretty){ text-wrap: pretty; }

          .hero-image{
            position:absolute; z-index:0;
            max-width:none;
          }
          @media (max-width: 767px){
            .hero-image{
              bottom:0; left:50%;
              transform: translateX(-50%);
              height: 65vh; width: auto;
              object-fit: cover; object-position: bottom center;
            }
          }
          @media (min-width:768px) and (max-width:1023px){
            .hero-image{
              top:50%; right:-15%;
              transform: translateY(-50%);
              height: 95vh; width: auto;
              object-fit: cover; object-position: center right;
            }
          }
          @media (min-width:1024px){
            .hero-image{
              top:50%; left:20%;
              transform: translateY(-50%);
              height: 100vh; max-height:100vh; width:auto;
              object-fit: cover; object-position: center right;
            }
          }

          .hero-overlay{
            position:absolute; inset:0; z-index:1;
            background: linear-gradient(to right,
              rgba(255,255,255,0.98) 0%,
              rgba(247,244,241,0.92) 30%,
              rgba(247,244,241,0.6) 55%,
              transparent 100%
            );
          }
          @media (max-width:767px){
            .hero-overlay{
              background: linear-gradient(to bottom,
                rgba(255,255,255,0.98) 0%,
                rgba(247,244,241,0.94) 45%,
                rgba(247,244,241,0.6) 70%,
                transparent 100%
              );
            }
          }

          .result-subtitle{ position:relative; padding-top:12px; margin-top:8px; }
          .result-subtitle::before{
            content:''; position:absolute; top:0; left:0;
            width:64px; height:2.5px;
            background: linear-gradient(90deg, rgba(59,130,246,.65) 0%, transparent 100%);
            border-radius:2px;
          }
        `}</style>
      </section>

      <section id="comparison" className="relative py-6 sm:py-10 lg:py-12 section-bg-1">
        <SectionMarker n="01" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Как изменится ваша <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">работа с клиентами</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Сравните результаты до и после внедрения скриптов
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
            <div className="card-premium bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 fade-in-view">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full font-semibold text-xs sm:text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Сейчас
                </div>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 text-sm sm:text-[15px] text-gray-800">
                {[
                  "«Сколько стоит?» ~ Отвечаете только ценой и тишина.",
                  "«Подумаю» ~ Не знаете, что ответить: клиент уходит.",
                  "«Переписка 30+ минут» ~ Клиент остывает, теряете заявку.",
                  "«10 заявок» ~ Долгие диалоги приводят только к 2-3 записям.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 sm:gap-2.5 hover:bg-red-50/50 p-2 sm:p-2.5 rounded-xl transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-premium bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 fade-in-view" style={{ animationDelay: "0.05s" }}>
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full font-semibold text-xs sm:text-sm">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  После
                </div>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 text-sm sm:text-[15px] text-gray-800">
                {[
                  "«Сколько стоит?» ~ Презентуете ценность, получаете запись.",
                  "«Подумаю» ~ Мягкое возражение возвращает к записи.",
                  "«Переписка 5 минут» ~ Готовые фразы ведут к быстрой записи.",
                  "«10 заявок» ~ Чёткие диалоги дают 6-7 записей.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 sm:gap-2.5 hover:bg-green-50/50 p-2 sm:p-2.5 rounded-xl transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="relative py-6 sm:py-10 lg:py-12 section-bg-2">
        <SectionMarker n="02" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-7 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Почему это <span className="text-rose-600">важно</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Каждая потерянная заявка ~ это упущенная прибыль
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { img: "/images/money.png", title: "Сливаются деньги на рекламу", text: "Платите за заявки, но конвертируете лишь 20-30%. Остальные ~ выброшенный бюджет." },
              { img: "/images/clock.png", title: "Тратится время впустую", text: "По 30-40 минут на переписку с каждым. Уходит 3-4 часа в день." },
              { img: "/images/door.png", title: "Заявки уходят к конкуренту", text: "Пока вы думаете, клиент записывается к тем, кто отвечает быстро и уверенно." },
            ].map((c, i) => (
              <div key={i} className="card-premium rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 text-center bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 group fade-in-view" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="mb-3 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:scale-110 transition-transform duration-300">
                  <img src={c.img} alt="" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" loading="lazy" />
                </div>
                <h3 className="text-pretty font-bold text-sm sm:text-base mb-2 text-gray-900">{c.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="for" className="relative py-6 sm:py-10 lg:py-12 section-bg-1">
        <SectionMarker n="03" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-7 sm:mb-8 fade-in-view">
            Кому подходят <span className="text-emerald-600">скрипты</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { img: "/images/salon.png", title: "Владельцам салонов и студий", text: "Стандарт ответов, скорость и контроль: все отвечают одинаково сильно." },
              { img: "/images/med.png", title: "Медицинским центрам", text: "Админы закрывают заявки, врачи работают с реальными пациентами." },
              { img: "/images/team.png", title: "Мастерам-универсалам", text: "Ответы на типовые ситуации ведут быстрее к записи, увереннее в чате." },
              { img: "/images/one.png", title: "Узким специалистам", text: "Ногти, брови, ресницы, волосы, косметология, перманент. Блоки под услугу." },
            ].map((c, i) => (
              <div
                key={i}
                className="card-premium bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-100/60 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 fade-in-view"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                    <img src={c.img} alt="" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-pretty text-sm sm:text-[15px] font-bold text-gray-900">{c.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="whats-included" className="relative py-6 sm:py-10 lg:py-12 section-bg-2">
        <SectionMarker n="04" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-7 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Что входит в <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">систему скриптов</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">Полный набор инструментов для увеличения продаж</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { img: "/images/xmind.png", title: "Готовые диалоги", desc: "Контакты до оплаты: приветствия, презентация ценности, запись. Всё пошагово.", highlight: "презентация ценности" },
              { img: "/images/target.png", title: "Закрытие возражений", desc: "«Дорого», «Подумаю», «У другого дешевле». Мягкие ответы без давления.", highlight: "мягкие ответы без давления" },
              { img: "/images/salons.png", title: "Под каждую услугу", desc: "Маникюр, брови, ресницы, косметология, массаж. Учтена специфика каждой ниши.", highlight: "учтена специфика каждой ниши" },
              { img: "/images/bucle.png", title: "Возврат клиентов", desc: "Сценарии повторных записей и реактивации «спящей» базы без рекламы.", highlight: "реактивации «спящей» базы без рекламы" },
              { img: "/images/phone.png", title: "Гайд по внедрению", desc: "Старт за один день: пошаговый план и стандарты для команды.", highlight: "Старт за один день" },
              { img: "/images/rocket.png", title: "Итог", desc: "Больше записей, выше средний чек, меньше времени в переписке.", highlight: "выше средний чек", big: true },
            ].map((item, k) => (
              <div key={k} className="card-premium rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 group fade-in-view" style={{ animationDelay: `${k * 0.05}s` }}>
                <div className="mb-2.5 inline-flex items-center justify-center">
                  <img
                    src={item.img}
                    alt=""
                    className={`${item.big ? "w-12 h-12 sm:w-13 sm:h-13" : "w-10 h-10 sm:w-11 sm:h-11"} object-contain group-hover:scale-110 transition-transform duration-300`}
                    loading="lazy"
                  />
                </div>
                <h3 className="text-pretty text-sm sm:text-[15px] font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <HighlightedDesc text={item.desc} primaryHighlight={item.highlight} extraPhrases={["без давления", "каждой ниши"]} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="bonuses" className="relative py-6 sm:py-10 lg:py-12 bg-gradient-to-b from-purple-50/50 via-pink-50/30 to-white overflow-hidden">
        <SectionMarker n="05" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-6 sm:mb-7 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Бонусы</span> при покупке
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Суммарная ценность ~ 79€. Сегодня идут бесплатно со скриптами
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { image: "/images/bonus1.png", title: "Гайд «Работа с клиентской базой»", desc: "Повторные записи без рекламы ~ возвращайте старых клиентов.", old: "27€" },
              { image: "/images/bonus2.png", title: "Чек-лист «30+ источников клиентов»", desc: "Платные и бесплатные способы ~ где взять заявки уже сегодня.", old: "32€" },
              { image: "/images/bonus3.png", title: "Гайд «Продажи на консультации»", desc: "5 этапов продаж ~ мягкий апсейл дополнительных услуг.", old: "20€" },
            ].map((b, i) => (
              <div key={i} className="card-premium rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-center bg-white shadow-md border border-purple-100/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 fade-in-view" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="mb-3">
                  <img src={b.image} alt={`Бонус ${i + 1}`} className="w-24 h-32 sm:w-28 sm:h-36 mx-auto object-cover rounded-xl shadow-md" loading="lazy" />
                </div>
                <h3 className="text-pretty text-sm sm:text-[15px] font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">{b.desc}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-gray-400 line-through">{b.old}</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">0€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="immediate" className="relative py-6 sm:py-10 lg:py-12 section-bg-1">
        <SectionMarker n="06" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-7 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 inline-block relative">
              Что изменится <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">сразу</span>
            </h2>
            <div className="mx-auto mt-3 h-1 w-32 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full shadow-sm"></div>
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            {[
              "Перестанешь терять заявки из-за слабых ответов.",
              "Начнёшь закрывать больше записей уже с первого дня.",
              "Повысишь средний чек через правильные предложения.",
              "Станешь увереннее ~ на всё есть готовый ответ.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/85 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-teal-100/60 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group fade-in-view" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm sm:text-[15px] font-medium text-gray-800 leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="relative py-6 sm:py-10 lg:py-12 section-bg-2">
        <SectionMarker n="07" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-7 fade-in-view">
            Отзывы клиентов
          </h2>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-7 max-w-4xl mx-auto">
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                className="group cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-view"
                style={{ animationDelay: `${n * 0.05}s` }}
                onClick={() => openLightbox(`/images/reviews/review${n}.png`, n)}
                aria-label={`Открыть отзыв ${n}`}
              >
                <img
                  src={`/images/reviews/review${n}.png`}
                  alt={`Отзыв ${n}`}
                  className="w-full h-28 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2.5 sm:gap-3.5 justify-center items-center overflow-x-auto pb-2 reels-container">
            {INSTAGRAM_REELS.slice(0, 3).map((url, idx) => (
              <div
                key={url}
                className={`${idx === 1 ? 'reel-card-featured' : 'reel-card-small'
                  } rounded-xl sm:rounded-2xl overflow-hidden border-2 ${idx === 1 ? 'border-blue-400 shadow-xl' : 'border-gray-200'
                  } flex-shrink-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 fade-in-view`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <InstaEmbed url={url} maxWidth={idx === 1 ? 280 : 220} />
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .reels-container { max-width: 100%; scroll-snap-type: x mandatory; }
          .reels-container > * { scroll-snap-align: center; }

          .reel-card-small { width: 140px; height: 249px; }
          .reel-card-featured { width: 180px; height: 320px; }

          @media (min-width:640px){
            .reel-card-small { width: 200px; height: 356px; }
            .reel-card-featured { width: 260px; height: 463px; }
          }
          @media (min-width:1024px){
            .reel-card-small { width: 220px; height: 391px; }
            .reel-card-featured { width: 280px; height: 500px; }
          }

          .reel-card-small :global(iframe),
          .reel-card-featured :global(iframe) {
            width: 100% !important;
            height: 100% !important;
            display: block; border: none;
          }
        `}</style>
      </section>

      <section id="offer" className="relative py-6 sm:py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50">
        <SectionMarker n="08" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-7 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3">
              Полная система со скидкой <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">85%</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Специальное предложение на этой неделе • Предложение действует ограниченное время
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] fade-in-view">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-purple-500/10 rounded-full blur-3xl translate-y-12 -translate-x-12" />

              <div className="relative z-10 text-center">
                <div className="text-xs sm:text-sm uppercase tracking-wide text-gray-300 mb-3">Полный доступ</div>

                <div className="flex items-center justify-center gap-3 sm:gap-3.5 mb-4">
                  <span className="text-gray-400 line-through text-xl sm:text-2xl font-bold">127€</span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">19€</span>
                </div>

                <div className="mb-4 sm:mb-5 flex justify-center">
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 sm:px-5 py-2.5 sm:py-3 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
                    <span className="text-white text-base sm:text-lg">⏰</span>
                    {!finished ? (
                      <>
                        <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">До конца:</span>
                        <span className="font-bold tabular-nums text-white text-sm sm:text-base">
                          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-white text-xs sm:text-sm">Время истекло</span>
                    )}
                  </div>
                </div>

                <a
                  href={STRIPE_URL}
                  target="_blank"
                  rel="noopener"
                  className="block w-full text-center rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3.5 sm:py-4 px-5 sm:px-6 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl mb-4 min-h-[52px] relative overflow-hidden group"
                  aria-label="Купить полную систему со скидкой 85% ~ 19 евро"
                >
                  <span className="relative z-10 text-sm sm:text-base">Получить со скидкой 85%</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>

                <div className="text-xs sm:text-sm text-gray-300 mb-5 sm:mb-6 text-center">
                  Пожизненный доступ • Обновления включены • Без скрытых платежей
                </div>

                <div className="text-left mb-5 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 text-center">Что входит:</h3>
                  <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-200">
                    {[
                      "Готовые диалоги для всех ситуаций",
                      "Шаблоны под конкретную услугу",
                      "Бонус: гайд по работе с базой (27€)",
                      "Бонус: 30+ источников клиентов (32€)",
                      "Бонус: продажи на консультации (20€)",
                      "Пожизненный доступ и обновления",
                    ].map((t, i) => (
                      <li key={i} className="flex gap-2 sm:gap-2.5 items-start">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-green-400 flex-shrink-0 font-bold">✓</span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs flex-wrap">
                  <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-black text-white rounded-lg font-medium whitespace-nowrap">Apple Pay</div>
                  <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/20 text-white rounded-lg font-medium whitespace-nowrap">Google Pay</div>
                  <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/20 text-white rounded-lg font-medium whitespace-nowrap">Visa</div>
                  <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/20 text-white rounded-lg font-medium whitespace-nowrap">MasterCard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative py-6 sm:py-10 lg:py-12 section-bg-1">
        <SectionMarker n="09" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-7 fade-in-view">
            Частые вопросы
          </h2>

          <div className="space-y-3">
            {[
              { q: "Сработает в моей нише?", a: "Да. База универсальная и блоки под ногти/брови/ресницы/волосы/косметологию/перманент." },
              { q: "Не будет ли звучать «по-скриптовому»?", a: "Нет. Формулировки живые, адаптируешь под свой тон. Главное ~ следовать алгоритму." },
              { q: "Зачем это админам?", a: "Единый стандарт повышает конверсию, скорость и управляемость. Новички включаются быстрее." },
              { q: "Когда будут результаты?", a: "Часто в первые 24 часа: готовые фразы экономят время и быстрее ведут к записи." },
            ].map((f, i) => (
              <div key={i} className="border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1 fade-in-view" style={{ animationDelay: `${i * 0.05}s` }}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-5 sm:px-6 lg:px-7 py-4 text-left hover:bg-gray-50/60 flex justify-between items-center transition-colors min-h-[52px] group"
                  aria-label={`Вопрос: ${f.q}`}
                >
                  <span className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">{f.q}</span>
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 transition-all flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 sm:px-6 lg:px-7 py-4 border-t border-gray-100 bg-gray-50/40">
                    <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 sm:py-8 bg-white border-t border-gray-200 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Beauty Scripts</div>
          <p className="text-xs sm:text-sm text-gray-500">© {new Date().getFullYear()} Все права защищены</p>
        </div>
      </footer>

      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-3 z-50 lg:hidden shadow-2xl">
          <a
            href={STRIPE_URL}
            target="_blank"
            rel="noopener"
            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 px-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-center block hover:from-gray-800 hover:to-gray-700 transition-all flex items-center justify-between min-h-[52px] shadow-lg"
            aria-label="Купить скрипты за 19 евро"
          >
            <span>Скрипты ~ 19€</span>
            <span className="text-lg sm:text-xl">→</span>
          </a>
        </div>
      )}

      <style jsx global>{`
        .section-bg-1{
          background: linear-gradient(180deg, #fafbfc 0%, #f4f6f8 100%);
        }
        .section-bg-2{
          background: linear-gradient(180deg, #f9fafc 0%, #eff3f7 60%, #ffffff 100%);
        }

        .card-premium{ position:relative; transition:all .5s cubic-bezier(.4,0,.2,1); }
        .card-premium::before{
          content:''; position:absolute; inset:-1px; border-radius:inherit; padding:1px;
          background: linear-gradient(135deg, transparent 0%, rgba(59,130,246,.1) 50%, transparent 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity:0; transition: opacity .5s;
        }
        .card-premium:hover::before{ opacity:1; }

        .fade-in-view{ opacity:0; transform: translateY(20px); transition: opacity .7s ease, transform .7s ease; }
        .fade-in-view.is-visible{ opacity:1; transform: translateY(0); }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
