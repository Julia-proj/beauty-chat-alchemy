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
          position: absolute; left: .75rem; top: .5rem;
          display:flex; align-items:center; gap:8px; z-index:10;
          opacity:0; transform: translateY(8px);
          animation: marker-in .6s ease forwards; animation-delay: .1s;
        }
        @media (min-width:1024px){ .section-marker{ left:0; top:.25rem; transform: translate(-54px,0); } }
        .marker-number{ font-weight:700; font-size:13px; letter-spacing:.12em; color:rgba(148,163,184,.75); font-variant-numeric:tabular-nums; }
        @media (min-width:1024px){ .marker-number{ font-size:15px; } }
        .marker-line{ width:28px; height:1px; background:linear-gradient(90deg, rgba(148,163,184,.4) 0%, transparent 100%); }
        @media (min-width:1024px){ .marker-line{ width:36px; } }
        @keyframes marker-in{ from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
      `}</style>
    </div>
  );
}

function ReviewLightbox({ isOpen, onClose, imageSrc, reviewNumber }:{
  isOpen:boolean; onClose:()=>void; imageSrc:string; reviewNumber:number;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="max-w-2xl max-h-[90vh] relative animate-scale-in" onClick={(e)=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 w-10 h-10 flex items-center justify-center" aria-label="Закрыть">✕</button>
        <img src={imageSrc} alt={`Отзыв ${reviewNumber}`} className="w-full h-auto rounded-2xl shadow-2xl" />
      </div>
    </div>
  );
}

function ScrollProgress(){
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(()=>{
    const update=()=>{
      const s = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((s/h)*100);
    };
    window.addEventListener('scroll', update, {passive:true});
    update();
    return ()=>window.removeEventListener('scroll', update);
  },[]);
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-[60]">
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-300" style={{width:`${scrollProgress}%`}}/>
    </div>
  );
}

function HighlightedDesc({ text, primaryHighlight, extraPhrases=[] as string[] }:{
  text:string; primaryHighlight?:string; extraPhrases?:string[];
}){
  const escapeHtml = (s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  let html = escapeHtml(text);
  if (primaryHighlight){
    const ph = escapeHtml(primaryHighlight);
    html = html.replace(new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"), `<span class="text-blue-600 font-semibold">${ph}</span>`);
  }
  for (const p0 of extraPhrases){
    const p = escapeHtml(p0);
    html = html.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"), `<span class="text-blue-600 font-semibold">${p}</span>`);
  }
  return <span dangerouslySetInnerHTML={{__html: html}} />;
}

export default function App(){
  const [openFaq, setOpenFaq] = useState<number|null>(null);
  const [viewersCount, setViewersCount] = useState(12);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxReviewNumber, setLightboxReviewNumber] = useState(1);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const { h, m, s, finished } = useCountdown(12);

  useEffect(()=>{
    const id = setInterval(()=>{
      setViewersCount(prev=>{
        const change = Math.floor(Math.random()*5)-2;
        const next = prev + change;
        return Math.max(8, Math.min(18, next));
      });
    }, 6000 + Math.random()*5000);
    return ()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    const onScroll=()=>{
      const scrolled = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setShowStickyCTA(scrolled > 30);
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    return ()=>window.removeEventListener('scroll', onScroll);
  },[]);

  useEffect(()=>{
    const io = new IntersectionObserver(
      (entries)=>entries.forEach(e=>{ if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: .15, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll<HTMLElement>(".fade-in-view").forEach(el=>io.observe(el));
    return ()=>io.disconnect();
  },[]);

  const openLightbox = (src:string, n:number)=>{ setLightboxImage(src); setLightboxReviewNumber(n); setLightboxOpen(true); };
  const toggleFaq = (i:number)=> setOpenFaq(openFaq===i?null:i);

  return (
    <div className="min-h-screen bg-[#ebe9e6] overflow-x-hidden">
      <ReviewLightbox isOpen={lightboxOpen} onClose={()=>setLightboxOpen(false)} imageSrc={lightboxImage} reviewNumber={lightboxReviewNumber} />
      <ScrollProgress />

      {/* Viewers badge (desktop) */}
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
      <header className="fixed top-0 left-0 right-0 bg-white/60 sm:bg-white/70 backdrop-blur-2xl z-[55] border-b border-gray-200/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Beauty Scripts</div>
          <a href={STRIPE_URL} target="_blank" rel="noopener" className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-800 transition-all hover:scale-105 min-h-[44px]" aria-label="Купить скрипты">Купить</a>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative w-full min-h-screen overflow-hidden pt-[76px] sm:pt-[92px] bg-[#ebe9e6]">
        {/* Фото-фон — не меняем, только позиционирование */}
        <img
          src="/images/IMG_6537.jpeg"
          alt="Beauty professional"
          className="hero-photo"
          loading="eager"
          decoding="async"
        />

        {/* Мягкий градиент слева */}
        <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ebe9e6] via-[#ebe9e6]/55 to-transparent md:via-[#ebe9e6]/45 md:to-transparent" />
        </div>

        {/* Контент */}
        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 items-start">
            <div className="hero-copy max-w-xl lg:max-w-2xl lg:col-span-6 fade-in-view">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] mb-4 sm:mb-5 text-gray-900">
                Скрипты, которые превращают{" "}
                <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  сообщения в деньги
                </span>
              </h1>

              <div className="result-subtitle mb-3 sm:mb-4">
                <p className="text-base sm:text-xl lg:text-2xl font-semibold leading-relaxed text-gray-800">
                  Проверенная система общения с клиентами для бьюти-мастеров
                </p>
              </div>

              {/* РЕЗУЛЬТАТ — сдвинут на ~2/3 высоты фото на мобиле */}
              <p className="hero-result text-sm sm:text-base lg:text-lg text-gray-800 mb-2 leading-relaxed">
                <span className="font-semibold uppercase tracking-wide text-blue-600">РЕЗУЛЬТАТ:</span>{" "}
                закрытые возражения, увеличенный средний чек, экономия времени
              </p>
            </div>
            <div className="hidden lg:block lg:col-span-6" />
          </div>
        </div>

        {/* CTA снизу фото — слева, без строчки Apple/GooglePay */}
        <div className="hero-cta">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-start gap-3">
              <a
                href={STRIPE_URL}
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl text-base sm:text-lg font-bold hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-2xl min-h-[52px] relative overflow-hidden"
                aria-label="Купить скрипты за 19 евро"
              >
                <span className="relative z-10">Купить</span>
                <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">→</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>

              {/* только бейджи безопасности */}
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-700">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/70 flex items-center gap-1.5">
                  <span>🔒</span> Безопасная оплата
                </span>
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/70 flex items-center gap-1.5">
                  <span>✓</span> Stripe
                </span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          html, body { background:#ebe9e6; overscroll-behavior-y:none; }

          .hero-photo{
            position:absolute; inset:0; width:100%; height:100%;
            object-fit:cover; object-position:72% center;
          }
          @media (min-width:1024px){
            .hero-photo{
              object-fit:contain; width:auto; height:100%;
              right:-2%; left:auto; object-position:center right;
            }
          }
          @media (max-width:767px){
            .hero-photo{ object-position:60% 80%; }
          }

          /* обрезаем лишний "пустырь" над заголовком, но сам заголовок опускаем мягко */
          .hero-copy{ padding-top: clamp(8vh, 12vh, 16vh); }
          @media (min-width:1024px){ .hero-copy{ padding-top: 10vh; } }

          /* "результат" на ~2/3 высоты фото на мобиле */
          .hero-result{ margin-top: 36vh; }
          @media (min-width:390px){ .hero-result{ margin-top: 38vh; } }
          @media (min-width:480px){ .hero-result{ margin-top: 34vh; } }
          @media (min-width:768px){ .hero-result{ margin-top: 2rem; } } /* на планшет/десктоп — обычный отступ */

          .hero-cta{
            position:absolute; bottom:20px; left:0; right:0; z-index:3;
            width:100%;
          }

          .result-subtitle{ position:relative; padding-top:10px; margin-top:6px; }
          .result-subtitle::before{
            content:''; position:absolute; top:0; left:0; width:58px; height:2px;
            background:linear-gradient(90deg, rgba(59,130,246,.6) 0%, transparent 100%);
            border-radius:2px;
          }
        `}</style>
      </section>
      {/* ===== /HERO ===== */}

      {/* 01 - Comparison */}
      <section id="comparison" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#fafbfc_0%,#f0f4f8_100%)]">
        <SectionMarker n="01" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 fade-in-view">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Как изменится ваша{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">работа с клиентами</span>
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">Сравните результаты до и после внедрения скриптов</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
            <div className="card-premium bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-view">
              <div className="text-center mb-4">
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
                  "«10 заявок» → Долгие диалоги приводят только к 2–3 записям.",
                ].map((t,i)=>(
                  <li key={i} className="flex gap-2 hover:bg-red-50/50 p-2 rounded-xl transition-all">
                    <svg className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-premium bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-view" style={{animationDelay:"0.06s"}}>
              <div className="text-center mb-4">
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
                  "«10 заявок» → Чёткие диалоги дают 6–7 записей.",
                ].map((t,i)=>(
                  <li key={i} className="flex gap-2 hover:bg-green-50/50 p-2 rounded-xl transition-all">
                    <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 02 - Why */}
      <section id="why" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#f8f9fb_0%,#e8ecf1_50%,#ffffff_100%)]">
        <SectionMarker n="02" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 fade-in-view">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Почему это <span className="text-rose-600">важно</span>
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">Каждая потерянная заявка — это упущенная прибыль</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { img: "/images/money.png", title: "Сливаются деньги на рекламу", text: "Платите за заявки, но конвертируете лишь 20–30%. Остальные — выброшенный бюджет." },
              { img: "/images/clock.png", title: "Тратится время впустую", text: "По 30–40 минут на переписку с каждым. Уходит 3–4 часа в день." },
              { img: "/images/door.png", title: "Заявки уходят к конкуренту", text: "Пока вы думаете, клиент записывается к тем, кто отвечает быстро и уверенно." },
            ].map((c,i)=>(
              <div key={i} className="card-premium rounded-2xl border border-gray-100 p-5 text-center bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group fade-in-view" style={{animationDelay:`${i*0.06}s`}}>
                <div className="mb-3 inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:scale-105 transition-transform duration-300">
                  <img src={c.img} alt="" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" loading="lazy" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 - For */}
      <section id="for" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#fafbfc_0%,#f0f4f8_100%)]">
        <SectionMarker n="03" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 fade-in-view">
            Кому подходят <span className="text-emerald-600">скрипты</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              { img: "/images/salon.png", title: "Владельцам салонов и студий", text: "Стандарт ответов, скорость и контроль: все отвечают одинаково сильно." },
              { img: "/images/med.png", title: "Медицинским центрам", text: "Админы закрывают заявки, врачи работают с реальными пациентами." },
              { img: "/images/team.png", title: "Мастерам-универсалам", text: "Ответы на типовые ситуации ведут быстрее к записи, увереннее в чате." },
              { img: "/images/one.png", title: "Узким специалистам", text: "Ногти, брови, ресницы, волосы, косметология, перманент. Блоки под услугу." },
            ].map((c,i)=>(
              <div key={i} className="card-premium bg-white rounded-2xl p-5 border border-emerald-100/60 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-view" style={{animationDelay:`${i*0.06}s`}}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                    <img src={c.img} alt="" className="w-8 h-8 object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{c.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 - What's Included */}
      <section id="whats-included" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#f8f9fb_0%,#e8ecf1_50%,#ffffff_100%)]">
        <SectionMarker n="04" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 fade-in-view">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Что входит в <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">систему скриптов</span>
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">Полный набор инструментов для увеличения продаж</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { img: "/images/xmind.png", title: "Готовые диалоги", desc: "Контакты до оплаты: приветствия, презентация ценности, запись. Всё пошагово.", highlight: "презентация ценности" },
              { img: "/images/target.png", title: "Закрытие возражений", desc: "«Дорого», «Подумаю», «У другого дешевле». Мягкие ответы без давления.", highlight: "мягкие ответы без давления" },
              { img: "/images/salons.png", title: "Под каждую услугу", desc: "Маникюр, брови, ресницы, косметология, массаж. Учтена специфика каждой ниши.", highlight: "учтена специфика каждой ниши" },
              { img: "/images/bucle.png", title: "Возврат клиентов", desc: "Сценарии повторных записей и реактивации «спящей» базы без рекламы.", highlight: "реактивации «спящей» базы без рекламы" },
              { img: "/images/phone.png", title: "Гайд по внедрению", desc: "Старт за один день: пошаговый план и стандарты для команды.", highlight: "Старт за один день" },
              { img: "/images/rocket.png", title: "Итог", desc: "Больше записей, выше средний чек, меньше времени в переписке.", highlight: "выше средний чек", big: true },
            ].map((item,k)=>(
              <div key={k} className="card-premium rounded-2xl border border-gray-100 p-5 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group fade-in-view" style={{animationDelay:`${k*0.05}s`}}>
                <div className="mb-3 inline-flex items-center justify-center">
                  <img src={item.img} alt="" className={`${item.big?"w-14 h-14":"w-12 h-12"} object-contain group-hover:scale-105 transition-transform duration-300`} loading="lazy" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <HighlightedDesc text={item.desc} primaryHighlight={item.highlight} extraPhrases={["без давления", "каждой ниши"]} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 - Bonuses */}
      <section id="bonuses" className="relative py-8 sm:py-10 lg:py-12 bg-[linear-gradient(180deg,#f5f0ff_0%,#fff7fb_60%,#ffffff_100%)] overflow-hidden">
        <SectionMarker n="05" />
        <div className="confetti-container">
          {[...Array(10)].map((_,i)=>(
            <div key={i} className="confetti" style={{left:`${Math.random()*100}%`, animationDelay:`${Math.random()*3}s`, animationDuration:`${3+Math.random()*2}s`}}/>
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-6 fade-in-view">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Бонусы</span> при покупке
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">Суммарная ценность — 79€. Сегодня идут бесплатно со скриптами</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { image: "/images/bonus1.png", title: "Гайд «Работа с клиентской базой»", desc: "Повторные записи без рекламы → возвращайте старых клиентов.", old: "27€" },
              { image: "/images/bonus2.png", title: "Чек-лист «30+ источников клиентов»", desc: "Платные и бесплатные способы → где взять заявки уже сегодня.", old: "32€" },
              { image: "/images/bonus3.png", title: "Гайд «Продажи на консультации»", desc: "5 этапов продаж → мягкий апсейл дополнительных услуг.", old: "20€" },
            ].map((b,i)=>(
              <div key={i} className="card-premium rounded-2xl p-4 text-center bg-white shadow-sm border border-purple-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-view" style={{animationDelay:`${i*0.07}s`}}>
                <div className="mb-3">
                  <img src={b.image} alt={`Бонус ${i+1}`} className="w-28 h-36 sm:w-32 sm:h-40 mx-auto object-cover rounded-xl shadow" loading="lazy" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">{b.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1.5">{b.desc}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-gray-400 line-through">{b.old}</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">0€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .confetti-container{ position:absolute; inset:0; overflow:hidden; pointer-events:none; }
          .confetti{ position:absolute; width:8px; height:8px; opacity:0; background:linear-gradient(45deg,#b197fc 0%,#a29bfe 100%); animation:confetti-fall linear infinite; border-radius:2px; }
          .confetti:nth-child(2n){ background:linear-gradient(45deg,#f093fb 0%,#f5576c 100%); }
          .confetti:nth-child(3n){ background:linear-gradient(45deg,#4facfe 0%,#00f2fe 100%); }
          .confetti:nth-child(4n){ background:linear-gradient(45deg,#43e97b 0%,#38f9d7 100%); }
          @keyframes confetti-fall{ 0%{ transform:translateY(-80px) rotate(0); opacity:1; } 100%{ transform:translateY(100vh) rotate(360deg); opacity:0; } }
        `}</style>
      </section>

      {/* 06 - Immediate */}
      <section id="immediate" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#f2f9f6_0%,#ffffff_75%)]">
        <SectionMarker n="06" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 fade-in-view">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Что изменится{" "}
              <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">сразу</span>
            </h2>
            <div className="mx-auto mt-2 h-[2px] w-28 sm:w-32 bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {[
              "Перестанешь терять заявки из-за слабых ответов.",
              "Начнёшь закрывать больше записей уже с первого дня.",
              "Повысишь средний чек через правильные предложения.",
              "Станешь увереннее — на всё есть готовый ответ.",
            ].map((t,i)=>(
              <div key={i} className="flex items-start gap-3 bg-white/85 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-teal-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 fade-in-view" style={{animationDelay:`${i*0.06}s`}}>
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-[15px] sm:text-base font-medium text-gray-800 leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 - Reviews */}
      <section id="reviews" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#f5f7fa_0%,#ffffff_70%)]">
        <SectionMarker n="07" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 fade-in-view">Отзывы клиентов</h2>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 max-w-4xl mx-auto">
            {[1,2,4].map((n)=>(
              <button key={n} className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 fade-in-view" style={{animationDelay:`${n*0.05}s`}} onClick={()=>openLightbox(`/images/reviews/review${n}.png`, n)} aria-label={`Открыть отзыв ${n}`}>
                <img src={`/images/reviews/review${n}.png`} alt={`Отзыв ${n}`} className="w-full h-36 sm:h-56 object-cover group-hover:scale-[1.02] transition-transform duration-300" loading="lazy" />
              </button>
            ))}
          </div>

          {/* Reels */}
          <div className="flex gap-2.5 sm:gap-3.5 justify-center items-center overflow-x-auto pb-2 reels-container">
            {INSTAGRAM_REELS.slice(0,3).map((url,idx)=>(
              <div key={url} className={`${idx===1?'reel-card-featured':'reel-card-small'} rounded-2xl overflow-hidden border-2 ${idx===1?'border-blue-400 shadow-xl':'border-gray-200'} flex-shrink-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 fade-in-view`} style={{animationDelay:`${idx*0.08}s`}}>
                <InstaEmbed url={url} maxWidth={idx===1?280:220} />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .reels-container{ max-width:100%; scroll-snap-type:x mandatory; }
          .reels-container>*{ scroll-snap-align:center; }
          .reel-card-small{ width:150px; height:267px; }
          .reel-card-featured{ width:190px; height:338px; }
          @media (min-width:640px){ .reel-card-small{ width:210px; height:373px; } .reel-card-featured{ width:270px; height:480px; } }
          @media (min-width:1024px){ .reel-card-small{ width:220px; height:391px; } .reel-card-featured{ width:280px; height:500px; } }
          .reel-card-small :global(iframe), .reel-card-featured :global(iframe){ width:100%!important; height:100%!important; display:block; border:none; }
        `}</style>
      </section>

      {/* 08 - Offer (оплата + аккуратная строка + чек-лист) */}
      <section id="offer" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#ffffff_0%,#f7f5f3_70%)]">
        <SectionMarker n="08" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 fade-in-view">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3">
              Полная система со скидкой{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">85%</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Специальное предложение на этой неделе • Предложение действует ограниченное время
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.01] fade-in-view">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-400/10 rounded-full translate-y-12 -translate-x-12" />

              <div className="relative z-10 text-center">
                <div className="text-xs sm:text-sm uppercase tracking-wide text-gray-300 mb-3">Полный доступ</div>

                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
                  <span className="text-gray-400 line-through text-xl sm:text-2xl">127€</span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">19€</span>
                </div>

                <div className="mb-5">
                  <div className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
                    <span className="text-white text-lg">⏰</span>
                    {!finished ? (
                      <>
                        <span className="text-white text-sm font-medium">До конца:</span>
                        <span className="font-bold tabular-nums text-white text-base">
                          {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
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
                  className="block w-full text-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-5 px-6 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl mb-4 min-h-[56px] relative overflow-hidden group"
                  aria-label="Купить полную систему со скидкой 85% — 19 евро"
                >
                  <span className="relative z-10">Получить со скидкой 85%</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>

                {/* строка «без скрытых…» — ровно центр, аккуратные разделители */}
                <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-300 mb-6 px-2">
                  {["Без скрытых платежей","Пожизненный доступ","Обновления включены"].map((t,i)=>(
                    <li key={t} className="relative pl-0">
                      {t}
                      {i<2 && <span className="mx-3 text-gray-500">•</span>}
                    </li>
                  ))}
                </ul>

                {/* ЧТО ПОЛУЧИШЬ (галочки) — как просила, сохраняем */}
                <ul className="text-left grid grid-cols-1 gap-2.5 mb-4">
                  {[
                    "PDF и текстовые шаблоны ответов",
                    "Сценарии закрытия возражений",
                    "Гайды по внедрению и реактивации",
                    "3 бонуса (гайд, чек-лист, гайд)",
                  ].map((t)=>(
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex w-5 h-5 rounded-full bg-emerald-500/20 items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span className="text-sm sm:text-base text-gray-100/95">{t}</span>
                    </li>
                  ))}
                </ul>

                {/* Платёжные бейджи — только здесь */}
                <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs md:text-sm flex-wrap md:flex-nowrap">
                  <div className="px-2.5 py-1.5 bg-black text-white rounded-lg font-medium whitespace-nowrap">Apple Pay</div>
                  <div className="px-2.5 py-1.5 bg-white/20 text-white rounded-lg font-medium whitespace-nowrap">Google Pay</div>
                  <div className="px-2.5 py-1.5 text-white rounded-lg font-medium whitespace-nowrap" style={{background:"rgba(255,255,255,0.2)"}}>Visa</div>
                  <div className="px-2.5 py-1.5 text-white rounded-lg font-medium whitespace-nowrap" style={{background:"rgba(255,255,255,0.2)"}}>MasterCard</div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 - FAQ */}
      <section id="faq" className="relative py-8 sm:py-12 lg:py-14 bg-[linear-gradient(180deg,#f9f7f6_0%,#ffffff_70%)]">
        <SectionMarker n="09" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 fade-in-view">Частые вопросы</h2>

          <div className="space-y-3">
            {[
              { q: "Сработает в моей нише?", a: "Да. База универсальная и блоки под ногти/бровы/ресницы/волосы/косметологию/перманент." },
              { q: "Не будет ли звучать «по-скриптовому»?", a: "Нет. Формулировки живые, адаптируешь под свой тон. Главное — следовать алгоритму." },
              { q: "Зачем это админам?", a: "Единый стандарт повышает конверсию, скорость и управляемость. Новички включаются быстрее." },
              { q: "Когда будут результаты?", a: "Часто в первые 24 часа: готовые фразы экономят время и быстрее ведут к записи." },
            ].map((f,i)=>(
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 fade-in-view" style={{animationDelay:`${i*0.06}s`}}>
                <button onClick={()=>toggleFaq(i)} className="w-full px-6 lg:px-8 py-5 text-left hover:bg-gray-50 flex justify-between items-center transition-colors min-h-[48px] group" aria-label={`Вопрос: ${f.q}`}>
                  <span className="font-semibold text-base lg:text-lg text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">{f.q}</span>
                  <span className={`w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-transform flex-shrink-0 ${openFaq===i?"rotate-180":""}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                {openFaq===i && (
                  <div className="px-6 lg:px-8 py-5 border-t border-gray-100 bg-gray-50/40 animate-fade-in">
                    <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{f.a}</p>
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
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Beauty Scripts</div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Все права защищены</p>
        </div>
      </footer>

      {/* Sticky CTA - Mobile Only */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 z-50 lg:hidden shadow-2xl">
          <a href={STRIPE_URL} target="_blank" rel="noopener" className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-5 rounded-2xl font-bold text-base text-center block hover:from-gray-800 hover:to-gray-700 transition-all flex items-center justify-between min-h-[56px] shadow-lg" aria-label="Купить скрипты за 19 евро">
            <span>Скрипты — 19€</span>
            <span className="text-xl">→</span>
          </a>
        </div>
      )}

      <style>{`
        .card-premium{ position:relative; transition:all .3s ease; }
        .fade-in-view{ opacity:0; transform:translateY(18px); transition:opacity .7s ease, transform .7s ease; }
        .fade-in-view.is-visible{ opacity:1; transform:translateY(0); }
      `}</style>
    </div>
  );
}
