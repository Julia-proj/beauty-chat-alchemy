import React, { useState, useEffect } from "react";   

const STRIPE_URL = "https://buy.stripe.com/5kQdRb8cbglMf7E7dSdQQ00";

function InstaEmbed({ url, maxWidth }: { url: string; maxWidth: number }) {
  const reelId = url.split('/reel/')[1]?.split('/')[0];
  if (!reelId) return null;
  return (
    <div style={{ width: maxWidth, margin: '0 auto' }}>
      <iframe
        src={`https://www.instagram.com/reel/${reelId}/embed`}
        width={maxWidth}
        height={maxWidth * 1.78}
        frameBorder="0"
        scrolling="no"
        allowTransparency={true}
        style={{ border: 'none', overflow: 'hidden' }}
      />
    </div>
  );
}

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
          top: .5rem;
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
          .section-marker{ left:0; top:.25rem; transform: translate(-64px, 0); }
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

/* Компонент мягкой подсветки (синим) первого вхождения строки */
function Emph({ text, hit }: { text: string; hit?: string }) {
  if (!hit) return <>{text}</>;
  const i = text.indexOf(hit);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="hl">{hit}</span>
      {text.slice(i + hit.length)}
    </>
  );
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewersCount, setViewersCount] = useState(12);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxReviewNumber, setLightboxReviewNumber] = useState(1);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { h, m, s, finished } = useCountdown(12);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

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
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
      
      // Скрываем CTA у offer секции и футера
      const offerSection = document.getElementById('offer');
      const footer = document.querySelector('footer');
      const stickyCTA = document.getElementById('sticky-cta-mobile');
      
      if (offerSection && footer && stickyCTA) {
        const offerRect = offerSection.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Скрываем если секция offer видна на экране или футер виден
        const shouldHide = (offerRect.top < windowHeight && offerRect.bottom > 0) || footerRect.top < windowHeight;
        
        if (shouldHide) {
          stickyCTA.style.transform = 'translateY(100%)';
        } else if (scrolled > 30) {
          stickyCTA.style.transform = 'translateY(0)';
        }
      }
      
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

  // появление секций (fade-in + запуск конфетти)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          if ((e.target as HTMLElement).id === "bonuses") {
            (e.target as HTMLElement).classList.add("confetti-on");
          }
        }
      }),
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll<HTMLElement>(".fade-in-view, #bonuses").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // плавный скролл
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden no-awkward-breaks">
      <ReviewLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={lightboxImage}
        reviewNumber={lightboxReviewNumber}
      />

      {/* viewers badge desktop */}
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-white/95 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="font-medium tabular-nums">{viewersCount} онлайн</span>
        </div>
      </div>

      {/* header + progress */}
      <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-2xl z-50 border-b border-gray-200/30 shadow-sm">
        <div className="h-1 bg-gray-100 absolute top-0 left-0 right-0">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
        </div>
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

      {/* HERO */}
      <section className="relative w-[100vw] h-[100svh] overflow-hidden hero-wrap" style={{ isolation: 'isolate' }}>
        <img
          src="/images/IMG_6646.jpeg"
          alt="Beauty professional"
          className="hero-image"
          loading="eager"
          decoding="async"
        />

        {/* Мягкое разделение (градиент) для десктопа */}
        <div className="hero-split-gradient" />

        <div className="hero-vignette" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full h-full flex flex-col justify-between hero-content" style={{ paddingTop: '100px', paddingBottom: '44px' }}>
          {/* Верх: заголовок + подзаголовок */}
          <div className="max-w-xl lg:max-w-2xl fade-in-view">
            <h1 className="hero-h1 text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-4 sm:mb-5 text-gray-900">
              Скрипты, которые<br />
              превращают<br />
              <span className="hero-accent">
                сообщения в деньги
              </span>
            </h1>

            {/* Продающий подзаголовок */}
            <div className="hero-subtitle-box max-w-xl space-y-3 mb-1">
              <p className="hero-sub text-pretty text-base sm:text-lg lg:text-xl font-semibold leading-relaxed drop-volume">
                <strong>Beauty Scripts</strong> — это не просто шаблоны.
              </p>
              <p className="hero-sub text-pretty text-base sm:text-lg lg:text-xl font-medium leading-relaxed drop-volume">
                Это готовая система, которая превращает переписки в реальные продажи.
              </p>
              <p className="hero-sub text-pretty text-base sm:text-lg lg:text-xl font-medium leading-relaxed drop-volume">
                Работает в любой нише — адаптируй под себя и начни зарабатывать больше уже с первых сообщений.
              </p>
              <p className="hero-bonus text-pretty text-base sm:text-lg font-bold drop-volume">
                <span className="bonus-accent">+3 гайда в подарок</span> для быстрого старта 💬
              </p>
            </div>
          </div>

          {/* Низ: Результат + кнопка */}
          <div className="max-w-xl lg:max-w-2xl fade-in-view space-y-5 sm:space-y-5">
            <div className="max-w-md result-block">
              {/* результат: белый на мобайле, ЧЁРНЫЙ на десктопе */}
              <p className="result-text text-pretty leading-[1.45] drop-volume" style={{ fontSize: 'clamp(16px, 1.9vw, 22px)' }}>
                <span className="font-extrabold" style={{ letterSpacing: '0.01em' }}>
                  Результат:
                </span>{" "}
                закрытые возражения, увеличенный средний чек, экономия времени
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <a
                href="#offer"
                className="group inline-flex items-center gap-2.5 px-6 sm:px-7 lg:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-2xl min-h-[52px] relative overflow-hidden
                           bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                aria-label="Получить скрипты"
              >
                <span className="relative z-10">Получить скрипты</span>
                <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">→</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
              </a>

              <div className="hidden sm:flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="px-2.5 py-1.5 bg-black text-white rounded-lg font-medium">Apple Pay</span>
                <span className="px-2.5 py-1.5 bg-white/30 text-gray-900 rounded-lg font-medium border border-gray-300">
                  Google Pay
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/90 lg:text-gray-700">
              <span className="px-2.5 py-1.5 bg-black/40 lg:bg-gray-100 lg:border-gray-200 backdrop-blur-sm rounded-lg border border-white/20 flex items-center gap-1.5">
                <span>🔒</span> Безопасная оплата
              </span>
              <span className="px-2.5 py-1.5 bg-black/40 lg:bg-gray-100 lg:border-gray-200 backdrop-blur-sm rounded-lg border border-white/20 flex items-center gap-1.5">
                <span>✓</span> Stripe
              </span>
            </div>
          </div>
        </div>

        <style>{`
          :global(html, body, #__next){ background:#ffffff; margin:0; padding:0; }
          :global(body){ -webkit-overflow-scrolling: touch; }
          :global(.no-awkward-breaks){ word-break: keep-all; hyphens: manual; }
          :global(.text-balance){ text-wrap: balance; }
          :global(.text-pretty){ text-wrap: pretty; }
          :root { --safe-edge: 0px; }

          .hero-wrap{ background:#fff; }
          .hero-image{
            position:absolute; 
            left:0; top:0;
            width:100vw; height:100%;
            object-fit: cover;
            object-position: 68% center; 
            z-index:0;
            will-change: transform;
            background:#000;
          }

          .hero-vignette{
            position:absolute; inset:0; z-index:1;
            background:
              radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.02) 80%),
              linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.00) 100%);
            pointer-events:none;
          }

          /* Подзаголовки: белые по умолчанию */
          .hero-sub, .result-text, .hero-bonus { color:#ffffff; }
          
          .bonus-accent {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 900;
          }

          /* Десктоп — мягкое разделение и чёрные тексты */
          @media (min-width:1024px){
            .hero-wrap{ position:relative; }
            .hero-image{
              width:56vw; height:100%;
              left:unset; right:0;
              object-position: 62% center;
            }
            .hero-split-gradient{
              position:absolute; inset:0; z-index:0;
              background:
                linear-gradient(90deg,
                  #f4f6f8 0%,
                  #f7f9fb 32%,
                  #fafbfe 48%,
                  rgba(255,255,255,0.0) 62%);
            }
            .hero-content{ padding-top:130px !important; max-width:1200px; }

            /* важное: на светлом фоне делаем текст чёрным и без объёмной тени */
            .hero-sub, .result-text, .hero-bonus{
              color:#111 !important;
              text-shadow:none !important;
            }
            
            .bonus-accent {
              background: linear-gradient(135deg, #7B61FF 0%, #4F46E5 100%);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
          }

          @media (max-width: 767px){
            .hero-content{ padding-top: 100px !important; }
          }

          /* Усиленный контраст заголовка */
          .hero-h1 {
            font-weight: 800;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }

          /* Яркий акцент на ключевых словах */
          .hero-accent {
            background: linear-gradient(135deg, #7B61FF 0%, #4F46E5 50%, #2563EB 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 900;
          }

          .drop-volume{
            text-shadow:
              0 1px 0 rgba(255,255,255,0.25),
              0 0.5px 0 rgba(0,0,0,0.35),
              0 2px 6px rgba(0,0,0,0.28);
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }

          .result-block{ margin-top: 14px; }

          /* Компактная минималистичная плашка */
          .compact-note {
            position: relative;
            max-width: 270px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 10px;
            padding: 9px 10px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
            opacity: 0;
            animation: compact-note-fade-in 0.5s ease-out 0.6s forwards;
          }

          /* Мобильный: справа, ближе к верху */
          @media (max-width: 767px) {
            .compact-note {
              margin-left: auto;
              margin-right: 0;
            }
          }

          /* Десктоп: слева */
          @media (min-width: 1024px) {
            .compact-note {
              margin-left: 0;
            }
          }

          @keyframes compact-note-fade-in {
            to {
              opacity: 1;
            }
          }

          .compact-note-text {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Manrope', 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.4;
            color: #111;
            margin: 0;
          }
        `}</style>
      </section>

      {/* Новый блок: Описание/Суть */}
      <section id="about" className="relative py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="fade-in-view">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-5" style={{ lineHeight: '1.65', maxWidth: '68ch' }}>
              <p className="text-base sm:text-lg leading-relaxed">
                <strong className="text-gray-900">Скрипты — это не просто шаблон, это система продаж в сообщениях.</strong> Скрипты — это готовые последовательности фраз и действий, которые помогают мастеру уверенно вести диалог с клиентом на каждом этапе: от первого сообщения до записи. Они превращают хаотичное общение в систему, позволяя продавать профессионально, без давления и потери заявок.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                <strong className="text-gray-900">Скрипты экономят твое время, убирают стресс и дают уверенность.</strong> Ты перестаёшь «угадывать», что сказать, и начинаешь говорить так, чтобы клиент сам хотел прийти. С ними ты продаёшь не из позиции нужды, а из позиции эксперта.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Поэтому я собрала готовую базу скриптов — под разные ниши, ситуации и типы клиентов. Это не теория, а фразы, которые реально работают в бьюти-бизнесе.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Если ты хочешь <strong className="text-gray-900">перестать сливать заявки</strong> и начать <strong className="text-gray-900">продавать осознанно</strong> — переходи на сайт и забери свои скрипты прямо сейчас, и как бонус получи в подарок <strong className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">3 гайда 🎁</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Новый блок: Что внутри */}
      <section id="whats-inside" className="relative py-8 sm:py-12 lg:py-16 section-bg-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-12 fade-in-view">
            Что <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">внутри</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Изображение Xmind */}
            <div className="fade-in-view order-2 lg:order-1">
              <img 
                src="/images/xmind.png" 
                alt="Пример структуры скриптов в Xmind" 
                className="w-full h-auto rounded-2xl shadow-xl border border-gray-200"
                loading="lazy"
              />
            </div>

            {/* Список с галочками */}
            <div className="fade-in-view order-1 lg:order-2">
              <ul className="space-y-4">
                {[
                  { number: '1️⃣', text: 'Более 500 готовых сообщений' },
                  { number: '2️⃣', text: '5 основных ниш (PMU, кератин, массаж, косметология, маникюр)' },
                  { number: '3️⃣', text: 'Универсальные скрипты для любых направлений' },
                  { number: '4️⃣', text: 'Удобный формат Xmind + доступ к Google Drive' },
                  { number: '5️⃣', text: 'Можно перевести и использовать на любом языке' },
                  { number: '6️⃣', text: 'Бонусы и гайды после покупки' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3.5 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <span className="text-2xl flex-shrink-0">{item.number}</span>
                    <span className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed pt-0.5">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 01 - Сравнение */}
      <section id="comparison" className="relative py-4 sm:py-6 lg:py-8 section-bg-2">
        <SectionMarker n="01" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="text-center mb-4 sm:mb-5 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
              Как изменится ваша <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">работа</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="card-premium bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 fade-in-view">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full font-semibold text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Сейчас
                </div>
              </div>
              <ul className="space-y-3 text-[15px] sm:text-base text-gray-800">
                {[
                  "«Сколько стоит?» → Отвечаете только ценой и тишина.",
                  "«Подумаю» → Не знаете, что ответить: клиент уходит.",
                  "«Переписка 30+ минут» → Клиент остывает, теряете заявку.",
                  "«10 заявок» → Долгие диалоги приводят только к 2-3 записям.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2.5 hover:bg-red-50/50 p-2.5 rounded-xl transition-all duration-300">
                    <svg className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-premium bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 fade-in-view" style={{ animationDelay: "0.05s" }}>
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full font-semibold text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  После
                </div>
              </div>
              <ul className="space-y-3 text-[15px] sm:text-base text-gray-800">
                {[
                  "«Сколько стоит?» → Презентуете ценность, получаете запись.",
                  "«Подумаю» → Мягкое возражение возвращает к записи.",
                  "«Переписка 5 минут» → Готовые фразы ведут к быстрой записи.",
                  "«10 заявок» → Чёткие диалоги дают 6-7 записей.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2.5 hover:bg-green-50/50 p-2.5 rounded-xl transition-all duration-300">
                    <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 02 - Почему */}
      <section id="why" className="relative py-4 sm:py-6 lg:py-8 section-bg-1">
        <SectionMarker n="02" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="text-center mb-4 sm:mb-5 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
              Почему это <span className="text-rose-600">важно</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { img: "/images/money.png", title: "Сливаются деньги на рекламу", text: "Платите за заявки, но конвертируете лишь 20-30%. Остальные - выброшенный бюджет." },
              { img: "/images/clock.png", title: "Тратится время впустую", text: "По 30-40 минут на переписку с каждым. Уходит 3-4 часа в день." },
              { img: "/images/door.png", title: "Заявки уходят к конкуренту", text: "Пока вы думаете, клиент записывается к тем, кто отвечает быстро и уверенно." },
            ].map((c, i) => (
              <div key={i} className="card-premium rounded-3xl border border-gray-100 p-4 sm:p-6 text-center bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 group fade-in-view" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="mb-3.5 inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:scale-110 transition-transform duration-300">
                  <img src={c.img} alt="" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" loading="lazy" />
                </div>
                <h3 className="text-pretty font-bold text-base sm:text-lg mb-2 text-gray-900">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 - Кому подходят */}
      <section id="for" className="relative py-4 sm:py-6 lg:py-8 section-bg-2">
        <SectionMarker n="03" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4 sm:mb-5 fade-in-view">
            Кому подходят <span className="text-emerald-600">скрипты</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              { img: "/images/salon.png", title: "Владельцам салонов и студий", text: "Стандарт ответов, скорость и контроль: все отвечают одинаково сильно." },
              { img: "/images/med.png", title: "Медицинским центрам", text: "Админы закрывают заявки, врачи работают с реальными пациентами." },
              { img: "/images/team.png", title: "Мастерам-универсалам", text: "Ответы на типовые ситуации ведут быстрее к записи, увереннее в чате." },
              { img: "/images/one.png", title: "Узким специалистам", text: "Ногти, брови, ресницы, волосы, косметология, перманент. Блоки под услугу." },
            ].map((c, i) => (
              <div
                key={i}
                className="card-premium bg-white rounded-3xl p-6 border border-emerald-100/60 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 fade-in-view"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                    <img src={c.img} alt="" className="w-8 h-8 object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-pretty text-[17px] sm:text-lg font-bold text-gray-900">{c.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 - Форматы и доступ */}
      <section id="formats" className="relative py-4 sm:py-6 lg:py-8 section-bg-1">
        <SectionMarker n="04" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="text-center mb-4 sm:mb-5 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
              Форматы и <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">доступ</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              { img: "/images/xmind.png",   title: "Формат Xmind",        desc: "Интерактивная карта мышления — удобная навигация.",                highlight: "удобная навигация" },
              { img: "/images/target.png",  title: "Google Drive", desc: "Мгновенный доступ после покупки, работает на всех устройствах.",                      highlight: "на всех устройствах" },
              { img: "/images/phone.png",   title: "Пожизненный доступ",desc: "Оплачиваешь один раз — пользуешься всегда. Все обновления бесплатно.",                highlight: "все обновления бесплатно" },
              { img: "/images/rocket.png",  title: "Регулярные обновления",desc: "База постоянно пополняется новыми скриптами.",                         highlight: "постоянно пополняется" },
            ].map((item, k) => (
              <div key={k} className="card-premium rounded-2xl border border-gray-100 p-3.5 sm:p-5 bg-white hover:shadow-xl transition-all duration-400 hover:-translate-y-1 group fade-in-view" style={{ animationDelay: `${k * 0.05}s` }}>
                <div className="mb-2.5 inline-flex items-center justify-center">
                  <img
                    src={item.img}
                    alt=""
                    className={`w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300`}
                    loading="lazy"
                  />
                </div>
                <h3 className="text-pretty text-[14.5px] sm:text-[15px] font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-[13px] sm:text-sm text-gray-600 leading-relaxed">
                  <Emph text={item.desc} hit={item.highlight} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Синие выделения маркером */}
        <style>{`
          .hl{
            background: linear-gradient(transparent 60%, rgba(59,130,246,.28) 0);
            padding: 0 .1em;
            border-radius: .25em;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
          }
        `}</style>
      </section>

      {/* 05 - Бонусы — конфетти */}
      <section id="bonuses" className="relative py-4 sm:py-6 lg:py-8 bg-gradient-to-b from-purple-50/30 via-pink-50/15 to-white overflow-hidden">
        <SectionMarker n="05" />

        {/* Конфетти (стартуют ТОЛЬКО при confetti-on) */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-600 confetti-layer">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={`confetti c${i}`} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-3 relative">
          <div className="text-center mb-4 sm:mb-5 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">3 гайда</span> в подарок
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Суммарная ценность — 79€. Сегодня бесплатно
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              { image: "/images/bonus1.png", title: "Гайд «Работа с клиентской базой»", desc: "Повторные записи без рекламы → возвращайте старых клиентов.", old: "27€" },
              { image: "/images/bonus2.png", title: "Чек-лист «30+ источников клиентов»", desc: "Платные и бесплатные способы → где взять заявки уже сегодня.", old: "32€" },
              { image: "/images/bonus3.png", title: "Гайд «Продажи на консультации»", desc: "5 этапов продаж → мягкий апсейл дополнительных услуг.", old: "20€" },
            ].map((b, i) => (
              <div key={i} className="card-premium rounded-xl p-3.5 sm:p-4 text-center bg-white/90 backdrop-blur-sm border border-purple-100/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 fade-in-view" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="mb-2.5">
                  <img src={b.image} alt={`Бонус ${i + 1}`} className="w-24 h-32 sm:w-24 sm:h-32 mx-auto object-cover rounded-lg shadow" loading="lazy" />
                </div>
                <h3 className="text-pretty text-[14.5px] sm:text-[15px] font-bold text-gray-900 mb-1.5">{b.title}</h3>
                <p className="text-[13.5px] sm:text-sm text-gray-600 leading-relaxed mb-2">{b.desc}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[14px] font-bold text-gray-400 line-through">{b.old}</span>
                  <span className="text-[15px] font-bold text-green-600">0€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          #bonuses.confetti-on .confetti-layer{ opacity:1; }
          .confetti{
            position:absolute; top:-8vh;
            width:5px; height:9px; border-radius:2px;
            opacity:.9; 
            animation: confetti-fall linear forwards;
            animation-play-state: paused; /* пауза по умолчанию */
            filter: drop-shadow(0 1px 1px rgba(0,0,0,.08));
          }
          #bonuses.confetti-on .confetti{
            animation-play-state: running; /* запускаем при появлении секции */
          }
          @keyframes confetti-fall{
            0%{ transform: translateY(-8vh) rotate(0deg); }
            100%{ transform: translateY(105vh) rotate(360deg); }
          }
          ${Array.from({length:18}).map((_,i)=>{
            const left = Math.floor(Math.random()*100);
            const dur = (Math.random()*2.5 + 3.8).toFixed(2);
            const delay = (Math.random()*0.8).toFixed(2);
            const colors = ['#c7d2fe','#e9d5ff','#fce7f3','#bfdbfe','#ddd6fe','#fecdd3'];
            const color = colors[i % colors.length];
            return `.confetti.c${i}{ left:${left}%; background:${color}; animation-duration:${dur}s; animation-delay:${delay}s; }`
          }).join('\n')}
        `}</style>
      </section>

      {/* 06 - Что изменится сразу */}
      <section id="immediate" className="relative py-4 sm:py-6 lg:py-8 section-bg-2">
        <SectionMarker n="06" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="text-center mb-4 sm:mb-5 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 inline-block relative">
              Что изменится <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">сразу</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              "Перестанешь терять заявки из-за слабых ответов.",
              "Начнёшь закрывать больше записей уже с первого дня.",
              "Повысишь средний чек через правильные предложения.",
              "Станешь увереннее — на всё есть готовый ответ.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3.5 bg-white/85 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-teal-100/60 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group fade-in-view" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-[15.5px] sm:text-base font-medium text-gray-800 leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 - Отзывы + рилсы */}
      <section id="reviews" className="relative py-4 sm:py-6 lg:py-8 section-bg-1">
        <SectionMarker n="07" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4 sm:mb-5 fade-in-view">
            Отзывы клиентов
          </h2>

          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-9 max-w-4xl mx-auto">
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                className="group cursor-pointer rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-view"
                style={{ animationDelay: `${n * 0.05}s` }}
                onClick={() => openLightbox(`/images/reviews/review${n}.png`, n)}
                aria-label={`Открыть отзыв ${n}`}
              >
                <img
                  src={`/images/reviews/review${n}.png`}
                  alt={`Отзыв ${n}`}
                  className="w-full h-36 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* ТЕПЕРЬ 5 РИЛСОВ */}
          <div className="flex gap-3 sm:gap-4 justify-center items-center overflow-x-auto pb-2 reels-container">
            {INSTAGRAM_REELS.slice(0, 5).map((url, idx) => (
              <div
                key={url}
                className={`${idx === 2 ? 'reel-card-featured' : 'reel-card-small'
                  } rounded-2xl overflow-hidden border-2 ${idx === 2 ? 'border-blue-400 shadow-xl' : 'border-gray-200'
                  } flex-shrink-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 fade-in-view`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <InstaEmbed url={url} maxWidth={idx === 2 ? 280 : 220} />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .reels-container { max-width: 100%; scroll-snap-type: x mandatory; }
          .reels-container > * { scroll-snap-align: center; }

          .reel-card-small { width: 150px; height: 267px; }
          .reel-card-featured { width: 190px; height: 338px; }

          @media (min-width:640px){
            .reel-card-small { width: 210px; height: 373px; }
            .reel-card-featured { width: 270px; height: 480px; }
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

      {/* 08 - Оффер */}
      <section id="offer" className="relative py-5 sm:py-8 lg:py-10 bg-gradient-to-b from-white to-gray-50">
        <SectionMarker n="08" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="text-center mb-4 sm:mb-5 fade-in-view">
            <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-1">
              Полная система со скидкой <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">85%</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Специальное предложение • Ограниченное время
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] fade-in-view">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-purple-500/10 rounded-full blur-3xl translate-y-12 -translate-x-12" />

              <div className="relative z-10 text-center">
                <div className="text-sm uppercase tracking-wide text-gray-300 mb-3">Полный доступ</div>

                <div className="flex items-center justify-center gap-3.5 mb-4">
                  <span className="text-gray-400 line-through text-2xl sm:text-3xl font-bold">127€</span>
                  <span className="text-5xl sm:text-6xl font-extrabold text-white">19€</span>
                </div>

                {/* Таймер */}
                <div className="mb-5">
                  <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
                    <span className="text-white text-xl">⏰</span>
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

                {/* CTA */}
                <a
                  href={STRIPE_URL}
                  target="_blank"
                  rel="noopener"
                  className="block w-full text-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-5 px-6 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl mb-4 min-h-[56px] relative overflow-hidden group text-base sm:text-lg"
                  aria-label="Купить полную систему со скидкой 85% - 19 евро"
                >
                  <span className="relative z-10">Получить со скидкой 85%</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>

                <div className="text-xs sm:text-sm text-gray-300 mb-5 text-center offer-bullets">
                  Пожизненный доступ • Обновления включены • <span className="nobr">Без&nbsp;скрытых&nbsp;платежей</span>
                </div>

                <div className="text-left mb-6">
                  <h3 className="text-lg font-bold text-white mb-3 text-center">Что входит:</h3>
                  <ul className="space-y-2.5 text-sm text-gray-200">
                    {[
                      "Готовые диалоги для всех ситуаций",
                      "Шаблоны под конкретную услугу",
                      "Бонус: гайд по работе с базой (27€)",
                      "Бонус: 30+ источников клиентов (32€)",
                      "Бонус: продажи на консультации (20€)",
                      "Пожизненный доступ и обновления",
                    ].map((t, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0 font-bold">✓</span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                  <div className="px-2.5 py-1.5 bg-black text-white rounded-lg font-medium whitespace-nowrap">Apple Pay</div>
                  <div className="px-2.5 py-1.5 bg-white/20 text-white rounded-lg font-medium whitespace-nowrap">Google Pay</div>
                  <div className="px-2.5 py-1.5 bg-white/20 text-white rounded-lg font-medium whitespace-nowrap">Visa</div>
                  <div className="px-2.5 py-1.5 bg-white/20 text-white rounded-lg font-medium whitespace-nowrap">Mastercard</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .offer-bullets{
            font-size: clamp(11px, 2vw, 13.5px);
            letter-spacing: -0.01em;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
          }
          .nobr{ white-space: nowrap; }
        `}</style>
      </section>

      {/* 09 - FAQ */}
      <section id="faq" className="relative py-4 sm:py-6 lg:py-8 section-bg-2">
        <SectionMarker n="09" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4 sm:mb-5 fade-in-view">
            Частые вопросы
          </h2>

          <div className="space-y-3.5">
            {[
              { q: "Сработает в моей нише?", a: "Да. База универсальная и блоки под ногти/брови/ресницы/волосы/косметологию/перманент." },
              { q: "Не будет ли звучать «по-скриптовому»?", a: "Нет. Формулировки живые, адаптируешь под свой тон. Главное - следовать алгоритму." },
              { q: "Зачем это админам?", a: "Единый стандарт повышает конверсию, скорость и управляемость. Новички включаются быстрее." },
              { q: "Когда будут результаты?", a: "Часто в первые 24 часа: готовые фразы экономят время и быстрее ведут к записи." },
            ].map((f, i) => (
              <div key={i} className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-500 hover:-translate-y-1 fade-in-view" style={{ animationDelay: `${i * 0.05}s` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 lg:px-8 py-5 text-left hover:bg-gray-50/60 flex justify-between items-center transition-colors min-h-[52px] group"
                  aria-label={`Вопрос: ${f.q}`}
                >
                  <span className="font-bold text-base lg:text-lg text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">{f.q}</span>
                  <span className={`w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 lg:px-8 py-5 border-t border-gray-100 bg-gray-50/40">
                    <p className="text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 bg-white border-t border-gray-200 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5">Beauty Scripts</div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Все права защищены</p>
        </div>
      </footer>

      {/* Sticky CTA - Mobile - скрывается у offer секции и футера */}
      {showStickyCTA && (
        <div 
          id="sticky-cta-mobile" 
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-3.5 z-50 lg:hidden shadow-2xl transition-transform duration-300"
        >
          <a
            href="#offer"
            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 px-5 rounded-2xl font-bold text-base text-center block hover:from-gray-800 hover:to-gray-700 transition-all flex items-center justify-between min-h-[52px] shadow-lg"
            aria-label="Получить скрипты"
          >
            <span>Получить скрипты →</span>
            <span className="text-xl" aria-hidden> </span>
          </a>
        </div>
      )}

      <style>{`
        .section-bg-1{
          background: linear-gradient(180deg, #fafbfc 0%, #f2f5f8 100%);
        }
        .section-bg-2{
          background: linear-gradient(180deg, #f8f9fb 0%, #eef2f6 60%, #ffffff 100%);
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
      `}</style>
    </div>
  );
}
