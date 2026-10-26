/* =========================================================
   MUSIC COOKIES — script.js
   1. Configuração  2. Links do WhatsApp  3. Fade-in  4. Ano
   ========================================================= */

/* 1. CONFIGURAÇÃO ------------------------------------------
   TROQUE pelo número real: código do país + DDD + número,
   somente dígitos. Ex.: 5532999999999 */
const WHATSAPP_NUMBER = "5532999999999";
const DEFAULT_MESSAGE = "Olá! Quero dar o play no meu pedido da Music Cookies.";

/* 2. LINKS DO WHATSAPP -------------------------------------
   Todo elemento com [data-wa] vira um link do WhatsApp.
   Use data-msg="..." para personalizar a mensagem. */
function setupWhatsAppLinks() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const text = el.dataset.msg || DEFAULT_MESSAGE;
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    el.target = "_blank";
    el.rel = "noopener";
  });
}

/* 3. FADE-IN AO ROLAR --------------------------------------
   Elementos .reveal aparecem quando entram na tela. */
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`; // leve escalonamento
    observer.observe(el);
  });
}

/* 3b. DISCO QUE TOCA ----------------------------------------
   Melodia curta e original, gerada no navegador (Web Audio),
   sem arquivo de áudio. Para usar uma música sua, veja o
   comentário "TROCAR POR ARQUIVO" abaixo. */
const BPM = 96;
const EIGHTH = 60 / BPM / 2;
// Progressão C – Am – F – G, 8 notas (MIDI) por compasso
const MELODY = [
  [72, 76, 79, 76, 72, 76, 79, 84],
  [69, 72, 76, 72, 69, 72, 76, 81],
  [69, 72, 77, 72, 69, 72, 77, 81],
  [71, 74, 79, 74, 71, 74, 79, 83],
];
const BASS = [48, 45, 41, 43];

function setupDisc() {
  const disc = document.getElementById("disc");
  const hint = document.getElementById("disc-hint");
  if (!disc) return;

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { disc.disabled = true; return; }

  let ctx, master, timer, step = 0, nextTime = 0, playing = false;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // Uma nota com ataque rápido e queda suave
  function tone(midi, t, dur, type, vol) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = mtof(midi);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Agenda as próximas notas um pouco à frente do relógio de áudio
  function schedule() {
    while (nextTime < ctx.currentTime + 0.3) {
      const bar = Math.floor(step / 8) % 4;
      const i = step % 8;
      tone(MELODY[bar][i], nextTime, 0.55, "triangle", 0.16);
      if (i % 4 === 0) tone(BASS[bar], nextTime, 0.9, "sine", 0.28);
      nextTime += EIGHTH;
      step++;
    }
  }

  function setState(on) {
    playing = on;
    disc.classList.toggle("is-playing", on);
    disc.setAttribute("aria-pressed", String(on));
    disc.setAttribute("aria-label", on ? "Pausar música" : "Tocar música");
    if (hint) hint.textContent = on ? "Tocando… toque de novo para pausar" : "Toque no disco e ouça";
  }

  disc.addEventListener("click", async () => {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    if (!playing) {
      await ctx.resume();
      nextTime = Math.max(nextTime, ctx.currentTime + 0.05);
      timer = setInterval(schedule, 100);
      setState(true);
    } else {
      clearInterval(timer);
      await ctx.suspend();
      setState(false);
    }
  });

  /* TROCAR POR ARQUIVO: para tocar um MP3 seu, crie
     const audio = new Audio("musica.mp3"); audio.loop = true;
     e use audio.play() / audio.pause() no lugar do bloco acima. */
}

/* 4. ANO DO RODAPÉ ----------------------------------------- */
function setupYear() {
  const el = document.getElementById("ano");
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupReveal();
  setupDisc();
  setupYear();
});