// URL Web App Google Apps Script
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxHjU1itJjBNQJQPlNUEAaM85Lcf8pFcMlvJd6MZowix2zNNPgC3njbrxyIakTl-7BT/exec";

// Daftar urutan tab (6 Tab)
const TAB_ORDER = [
  "tab-umum",
  "tab-register",
  "tab-demografi",
  "tab-keterangan",
  "tab-pembinaan",
  "tab-anggaran",
];
let currentTabIndex = 0;

// Variable global untuk menyimpan instance Chart.js
let ketDalamChart = null;

document.addEventListener("DOMContentLoaded", () => {
  // Set tanggal hari ini secara otomatis
  const today = new Date();
  const dateInput = document.getElementById("tanggal");
  if (dateInput) dateInput.valueAsDate = today;

  // Inisialisasi Tab
  initTabs();

  // Listener input & change untuk update otomatis ke infografis
  const form = document.getElementById("wbpForm");
  if (form) {
    form.addEventListener("input", updateInfographicValues);
    form.addEventListener("change", updateInfographicValues);
  }

  // Listener Tombol Navigasi & Aksi
  document.getElementById("btnNext")?.addEventListener("click", handleNextTab);
  document.getElementById("btnPrev")?.addEventListener("click", handlePrevTab);
  document.getElementById("btnSave")?.addEventListener("click", handleSaveToSpreadsheet);
  document.getElementById("btnDownload")?.addEventListener("click", handleDownloadImage);
  document.getElementById("btnShareWa")?.addEventListener("click", handleShareWhatsApp);

  // Inisialisasi awal
  updateInfographicValues();
  updateActionButtons();

  // Register PWA Service Worker jika didukung
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("Service Worker terdaftar:", reg))
      .catch((err) => console.error("Gagal mendaftarkan Service Worker:", err));
  }
});

// Inisialisasi Klik Tab Manual
function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      switchTab(index);
    });
  });
}

// Pindah Tab Berdasarkan Index
function switchTab(index) {
  if (index < 0 || index >= TAB_ORDER.length) return;

  currentTabIndex = index;
  const targetId = TAB_ORDER[currentTabIndex];

  document.querySelectorAll(".tab-btn").forEach((b, i) => {
    if (i === currentTabIndex) b.classList.add("active");
    else b.classList.remove("active");
  });

  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById(targetId)?.classList.add("active");

  updateActionButtons();
}

// Navigasi Lanjutkan
function handleNextTab() {
  if (currentTabIndex < TAB_ORDER.length - 1) {
    switchTab(currentTabIndex + 1);
  }
}

// Navigasi Kembali
function handlePrevTab() {
  if (currentTabIndex > 0) {
    switchTab(currentTabIndex - 1);
  }
}

// Mengatur Visibilitas Tombol Berdasarkan Tab Aktif
function updateActionButtons() {
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnSave = document.getElementById("btnSave");
  const btnDownload = document.getElementById("btnDownload");
  const btnShareWa = document.getElementById("btnShareWa");

  if (btnPrev) btnPrev.style.display = currentTabIndex > 0 ? "flex" : "none";

  if (currentTabIndex < TAB_ORDER.length - 1) {
    if (btnNext) btnNext.style.display = "flex";
    if (btnSave) btnSave.style.display = "none";
    if (btnDownload) btnDownload.style.display = "none";
    if (btnShareWa) btnShareWa.style.display = "none";
  } else {
    if (btnNext) btnNext.style.display = "none";
    if (btnSave) btnSave.style.display = "flex";
    if (btnDownload) btnDownload.style.display = "flex";
    if (btnShareWa) btnShareWa.style.display = "flex";
  }
}

// Format Tanggal Bahasa Indonesia
function formatDateIndonesian(dateString) {
  if (!dateString) return "-";
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", options);
}

// Format Mata Uang Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka || 0);
}

// Toast Notifikasi Sederhana
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = message;
  toast.style.borderColor =
    type === "error" ? "#ef4444" : type === "success" ? "#22c55e" : "#3b82f6";
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

// Render atau perbarui Diagram Batang Chart.js
function updateChartKetDalamLapas(dataValues) {
  const ctx = document.getElementById("chartKetDalamLapas");
  if (!ctx || typeof Chart === "undefined") return;

  const labels = [
    "Teroris",
    "Narkoba",
    "Psiko",
    "Kesehatan",
    "Korupsi",
    "Pidum",
    "Ilegal Log",
    "Trafficking",
    "Pidana Mati",
    "Pidana SH",
  ];

  if (ketDalamChart) {
    ketDalamChart.data.datasets[0].data = dataValues;
    ketDalamChart.update();
  } else {
    ketDalamChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Jumlah WBP",
            data: dataValues,
            backgroundColor: "#0d2b45",
            borderColor: "#0d2b45",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Animasi dimatikan agar html2canvas bisa menangkap grafik dengan sempurna
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 9, weight: "bold" },
              color: "#0d2b45",
            },
            grid: { color: "#cbd5e1" },
          },
          x: {
            ticks: {
              font: { size: 8, weight: "600" },
              color: "#0d2b45",
              maxRotation: 45,
              minRotation: 45,
            },
            grid: { display: false },
          },
        },
      },
    });
  }
}

// Update Nilai Infografis & Ringkasan Stats
function updateInfographicValues() {
  let totalRegA = 0;
  document
    .querySelectorAll(".regA")
    .forEach((el) => (totalRegA += Number(el.value || 0)));

  let totalRegB = 0;
  document
    .querySelectorAll(".regB")
    .forEach((el) => (totalRegB += Number(el.value || 0)));

  const mappings = [
    { in: "kapasitas", out: "out-kapasitas" },
    { in: "jumlahPenghuni", out: "out-jumlahPenghuni" },
    { in: "diDalamLapas", out: "out-diDalamLapas" },
    { in: "diLuarLapas", out: "out-diLuarLapas" },
    { in: "regAI", out: "out-regAI" },
    { in: "regAII", out: "out-regAII" },
    { in: "regAIII", out: "out-regAIII" },
    { in: "regAIV", out: "out-regAIV" },
    { in: "regAV", out: "out-regAV" },
    { in: "regBI", out: "out-regBI" },
    { in: "regBIIa", out: "out-regBIIa" },
    { in: "regBIIb", out: "out-regBIIb" },
    { in: "regBIII", out: "out-regBIII" },
    { in: "regSH", out: "out-regSH" },
    { in: "jkLaki", out: "out-jkLaki" },
    { in: "jkPerempuan", out: "out-jkPerempuan" },
    { in: "napiLaki", out: "out-napiLaki" },
    { in: "napiPerempuan", out: "out-napiPerempuan" },
    { in: "tahananLaki", out: "out-tahananLaki" },
    { in: "tahananPerempuan", out: "out-tahananPerempuan" },
    { in: "bonSakit", out: "out-bonSakit" },
    { in: "bonKejaksaan", out: "out-bonKejaksaan" },
    { in: "bonLain", out: "out-bonLain" },
    { in: "m13", out: "out-m13" },
    { in: "m12", out: "out-m12" },
    { in: "m23", out: "out-m23" },
    { in: "kewarganegaraanWni", out: "out-kewarganegaraanWni" },
    { in: "kewarganegaraanWna", out: "out-kewarganegaraanWna" },
    { in: "residivis", out: "out-residivis" },
  ];

  const rawDate = document.getElementById("tanggal")?.value;
  if (document.getElementById("out-tanggal")) {
    document.getElementById("out-tanggal").innerText = formatDateIndonesian(rawDate);
  }

  mappings.forEach((item) => {
    const inputEl = document.getElementById(item.in);
    const outEl = document.getElementById(item.out);
    if (inputEl && outEl) {
      outEl.innerText = inputEl.value || 0;
    }
  });

  if (document.getElementById("out-totalRegA")) document.getElementById("out-totalRegA").innerText = totalRegA;
  if (document.getElementById("out-totalRegB")) document.getElementById("out-totalRegB").innerText = totalRegB;

  // Render Diagram Batang Keterangan Di Dalam Lapas
  const chartData = [
    Number(document.getElementById("ketTeroris")?.value || 0),
    Number(document.getElementById("ketNarkoba")?.value || 0),
    Number(document.getElementById("ketPsikotropika")?.value || 0),
    Number(document.getElementById("ketKesehatan")?.value || 0),
    Number(document.getElementById("ketKorupsi")?.value || 0),
    Number(document.getElementById("ketPidum")?.value || 0),
    Number(document.getElementById("ketIlegalLogging")?.value || 0),
    Number(document.getElementById("ketHumanTrafficking")?.value || 0),
    Number(document.getElementById("ketPidanaMati")?.value || 0),
    Number(document.getElementById("ketPidanaSH")?.value || 0),
  ];
  updateChartKetDalamLapas(chartData);

  // Update Ringkasan Stat Atas
  const kap = Number(document.getElementById("kapasitas")?.value || 0);
  const penghuni = Number(document.getElementById("jumlahPenghuni")?.value || 0);
  const persen = kap > 0 ? Math.round((penghuni / kap) * 100) : 0;

  if (document.getElementById("card-kapasitas")) document.getElementById("card-kapasitas").innerText = kap;
  if (document.getElementById("card-penghuni")) document.getElementById("card-penghuni").innerText = penghuni;
  if (document.getElementById("card-persen")) document.getElementById("card-persen").innerText = persen + "%";

  const badge = document.getElementById("card-status-badge");
  if (badge) {
    if (persen > 100) {
      badge.innerText = "Overkapasitas";
      badge.style.color = "#dc2626";
    } else if (persen >= 85) {
      badge.innerText = "Waspada";
      badge.style.color = "#d97706";
    } else {
      badge.innerText = "Normal";
      badge.style.color = "#16a34a";
    }
  }

  // --- KODE PERHITUNGAN REALISASI ANGGARAN ---
  const tahun = document.getElementById("tahunAnggaran")
    ? document.getElementById("tahunAnggaran").value
    : "2026";
  const pagu = Number(
    document.getElementById("paguAnggaran")
      ? document.getElementById("paguAnggaran").value
      : 0
  );
  const realisasi = Number(
    document.getElementById("realisasiAnggaran")
      ? document.getElementById("realisasiAnggaran").value
      : 0
  );

  const persentase = pagu > 0 ? ((realisasi / pagu) * 100).toFixed(2) : "0,00";

  if (document.getElementById("out-tahunAnggaran")) {
    document.getElementById("out-tahunAnggaran").innerText = tahun;
  }
  if (document.getElementById("out-paguAnggaran")) {
    document.getElementById("out-paguAnggaran").innerText = formatRupiah(pagu);
  }
  if (document.getElementById("out-realisasiAnggaran")) {
    document.getElementById("out-realisasiAnggaran").innerText = formatRupiah(realisasi);
  }
  if (document.getElementById("out-persentaseAnggaran")) {
    document.getElementById("out-persentaseAnggaran").innerText =
      persentase.replace(".", ",") + "%";
  }
}

// Simpan ke Spreadsheet
async function handleSaveToSpreadsheet() {
  const btn = document.getElementById("btnSave");
  if (!btn) return;

  const icon = btn.querySelector(".btn-icon");
  const text = btn.querySelector(".btn-text");

  btn.disabled = true;
  if (icon) icon.innerHTML = '<span class="spinner"></span>';
  if (text) text.innerText = "Menyimpan...";

  try {
    const inputs = document.querySelectorAll("input, select");
    const formData = {};
    inputs.forEach((input) => {
      if (input.id) formData[input.id] = input.value || 0;
    });

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    btn.classList.add("btn-state-success");
    if (icon) icon.innerText = "✓";
    if (text) text.innerText = "Berhasil Disimpan!";
    showToast("✅ Data berhasil dikirim ke Google Spreadsheet!", "success");
  } catch (err) {
    showToast("❌ Gagal menyimpan data: " + err.message, "error");
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove("btn-state-success");
      if (icon) icon.innerText = "💾";
      if (text) text.innerText = "Simpan ke Spreadsheet";
    }, 2500);
  }
}

// Unduh Gambar Infografis
async function handleDownloadImage() {
  const btn = document.getElementById("btnDownload");
  if (!btn) return;

  const icon = btn.querySelector(".btn-icon");
  const text = btn.querySelector(".btn-text");

  btn.disabled = true;
  if (icon) icon.innerHTML = '<span class="spinner"></span>';
  if (text) text.innerText = "Memproses Gambar...";

  try {
    updateInfographicValues();

    const captureArea = document.getElementById("capture-area");
    const images = captureArea.getElementsByTagName("img");
    for (let img of images) {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
    }

    const canvas = await html2canvas(captureArea, {
      scale: 2,
      logging: false,
      allowTaint: false,
      useCORS: true,
    });

    const link = document.createElement("a");
    const dateVal = document.getElementById("tanggal")?.value || "Laporan";
    link.download = `Laporan_Harian_WBP_${dateVal}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    btn.classList.add("btn-state-success");
    if (icon) icon.innerText = "✓";
    if (text) text.innerText = "Gambar Diunduh!";
    showToast("🖼️ Gambar infografis berhasil diunduh!", "success");
  } catch (err) {
    showToast("❌ Gagal mengunduh gambar: " + err.message, "error");
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove("btn-state-success");
      if (icon) icon.innerText = "🖼️";
      if (text) text.innerText = "Unduh Gambar";
    }, 2500);
  }
}

// Share Gambar & Teks ke WhatsApp
async function handleShareWhatsApp() {
  const btn = document.getElementById("btnShareWa");
  if (!btn) return;

  const icon = btn.querySelector(".btn-icon");
  const text = btn.querySelector(".btn-text");

  btn.disabled = true;
  if (icon) icon.innerHTML = '<span class="spinner"></span>';
  if (text) text.innerText = "Memproses...";

  try {
    updateInfographicValues();

    // 1. Susun Teks Ringkasan Pesan
    const tgl = formatDateIndonesian(document.getElementById("tanggal")?.value);
    const kap = document.getElementById("kapasitas")?.value || 0;
    const penghuni = document.getElementById("jumlahPenghuni")?.value || 0;
    const didalam = document.getElementById("diDalamLapas")?.value || 0;
    const diluar = document.getElementById("diLuarLapas")?.value || 0;

    const thn = document.getElementById("tahunAnggaran")?.value || "2026";
    const pagu = formatRupiah(document.getElementById("paguAnggaran")?.value || 0);
    const realisasi = formatRupiah(document.getElementById("realisasiAnggaran")?.value || 0);
    const persentase = document.getElementById("out-persentaseAnggaran")?.innerText || "0%";

    const captionText = `*LAPORAN HARIAN SILASUM*
🏛️ *Lapas Kelas IIB Sumedang*
📅 *Tanggal:* ${tgl}

📊 *INFORMASI UMUM*
- Kapasitas: ${kap} Orang
- Jumlah Penghuni: ${penghuni} Orang
- Di Dalam Lapas: ${didalam} Orang
- Di Luar Lapas: ${diluar} Orang

💰 *REALISASI ANGGARAN ${thn}*
- Pagu: ${pagu}
- Realisasi: ${realisasi} (${persentase})`;

    // 2. Render Gambar dari Infografis
    const captureArea = document.getElementById("capture-area");
    const images = captureArea.getElementsByTagName("img");
    for (let img of images) {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
    }

    const canvas = await html2canvas(captureArea, {
      scale: 2,
      logging: false,
      allowTaint: false,
      useCORS: true,
    });

    // 3. Konversi Canvas ke File Blob
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    const dateVal = document.getElementById("tanggal")?.value || "WBP";
    const file = new File([blob], `Laporan_Harian_${dateVal}.png`, {
      type: "image/png",
    });

    // 4. Berbagi via Web Share API
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Laporan Harian Lapas Sumedang",
        text: captionText,
      });
      showToast("📲 Berhasil membuka menu berbagi!", "success");
    } else {
      await navigator.clipboard.writeText(captionText);
      const encodedText = encodeURIComponent(captionText);
      window.open(
        `https://api.whatsapp.com/send?text=${encodedText}`,
        "_blank"
      );
      showToast(
        "📋 Teks disalin! Gambar diunduh otomatis untuk Anda lampirkan di WA.",
        "info"
      );

      const link = document.createElement("a");
      link.download = file.name;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      showToast("❌ Gagal berbagi ke WhatsApp: " + err.message, "error");
    }
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      if (icon) icon.innerText = "📲";
      if (text) text.innerText = "Share ke WA";
    }, 1500);
  }
}

/* =====================================================
   TAMBAHAN INTERAKTIF (v2)
   - Hitung naik pada kartu statistik
   - Bar hunian & serapan anggaran
   - Progress langkah, centang tab, geser (swipe) antar tab
   - Tombol +/- pada kolom angka
   - Pemeriksaan konsistensi data
   - Mode gelap, draf otomatis, ripple, confetti
   ===================================================== */

const TAB_NAMES = ["Info Umum", "Register A & B", "Demografi", "Detail Pidana", "Tahap Pembinaan", "Anggaran"];
const visitedTabs = new Set([0]);
let lastDirection = 1;

// ---------- Util aman untuk localStorage ----------
function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
function lsDel(key) { try { localStorage.removeItem(key); } catch (e) {} }

function numVal(id) { return Number(document.getElementById(id)?.value || 0); }

function localDateString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ---------- Hitung naik ----------
function countTo(el, target, suffix = "") {
  if (!el) return;
  const prev = el.dataset.val === undefined ? target : Number(el.dataset.val);
  el.dataset.val = target;
  if (el._raf) cancelAnimationFrame(el._raf);
  if (prev === target) { el.innerText = target + suffix; return; }
  const start = performance.now();
  const dur = 450;
  const step = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.innerText = Math.round(prev + (target - prev) * eased) + suffix;
    if (t < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
  el.classList.remove("stat-pop");
  void el.offsetWidth;
  el.classList.add("stat-pop");
}

// ---------- Pembungkus fungsi bawaan ----------
const _origUpdateInfographic = updateInfographicValues;
updateInfographicValues = function () {
  _origUpdateInfographic();
  enhanceAfterUpdate();
};

const _origSwitchTab = switchTab;
switchTab = function (index) {
  if (index < 0 || index >= TAB_ORDER.length) return;
  lastDirection = index >= currentTabIndex ? 1 : -1;
  _origSwitchTab(index);
  afterTabSwitch();
};

const _origShowToast = showToast;
showToast = function (message, type) {
  _origShowToast(message, type);
  // Animasi toast diulang setiap kali tampil
  const t = document.getElementById("toast");
  if (t) { t.style.animation = "none"; void t.offsetWidth; t.style.animation = ""; }
  if (type === "success" && /Spreadsheet/i.test(message)) launchConfetti();
};

// ---------- Update tampilan setelah data berubah ----------
function enhanceAfterUpdate() {
  const kap = numVal("kapasitas");
  const penghuni = numVal("jumlahPenghuni");
  const persen = kap > 0 ? Math.round((penghuni / kap) * 100) : 0;

  countTo(document.getElementById("card-kapasitas"), kap);
  countTo(document.getElementById("card-penghuni"), penghuni);
  countTo(document.getElementById("card-persen"), persen, "%");

  // Bar hunian
  const fill = document.getElementById("hunianFill");
  const label = document.getElementById("hunianLabel");
  if (fill && label) {
    fill.style.width = Math.min(persen, 100) + "%";
    fill.classList.toggle("warn", persen >= 85 && persen <= 100);
    fill.classList.toggle("danger", persen > 100);
    if (kap <= 0) label.innerText = "Isi kapasitas & jumlah penghuni";
    else if (penghuni > kap) label.innerText = `Melebihi kapasitas ${penghuni - kap} orang (${persen}%)`;
    else label.innerText = `Sisa kapasitas ${kap - penghuni} orang (${persen}%)`;
  }

  // Serapan anggaran
  const pagu = numVal("paguAnggaran");
  const real = numVal("realisasiAnggaran");
  const bp = pagu > 0 ? (real / pagu) * 100 : 0;
  const bFill = document.getElementById("budgetFill");
  if (bFill) {
    bFill.style.width = Math.min(bp, 100) + "%";
    bFill.classList.toggle("danger", bp > 100);
  }
  const bPct = document.getElementById("budgetPercent");
  if (bPct) bPct.innerText = bp.toFixed(1).replace(".", ",") + "%";
  const bNote = document.getElementById("budgetNote");
  if (bNote) {
    if (pagu <= 0) bNote.innerText = "Isi pagu & realisasi untuk melihat serapan";
    else if (real > pagu) bNote.innerText = "Realisasi melebihi pagu, periksa kembali angkanya";
    else bNote.innerText = `Sisa anggaran ${formatRupiah(pagu - real)}`;
  }

  // Tanda kolom terisi
  document.querySelectorAll("#wbpForm input[type=number]").forEach((el) => {
    el.classList.toggle("filled", Number(el.value) > 0);
  });

  renderHints();
  scheduleDraftSave();
}

// ---------- Pemeriksaan konsistensi ----------
function renderHints() {
  const box = document.getElementById("smartHints");
  if (!box) return;

  const penghuni = numVal("jumlahPenghuni");
  const hints = [];

  if (penghuni > 0) {
    const dalam = numVal("diDalamLapas"), luar = numVal("diLuarLapas");
    if (dalam + luar !== penghuni)
      hints.push(`Di dalam (${dalam}) + di luar lapas (${luar}) = ${dalam + luar}, belum sama dengan jumlah penghuni (${penghuni}).`);

    let a = 0, b = 0;
    document.querySelectorAll(".regA").forEach((el) => (a += Number(el.value || 0)));
    document.querySelectorAll(".regB").forEach((el) => (b += Number(el.value || 0)));
    if (a + b !== penghuni)
      hints.push(`Register A (${a}) + Register B (${b}) = ${a + b}, belum sama dengan jumlah penghuni (${penghuni}).`);

    const lk = numVal("jkLaki"), pr = numVal("jkPerempuan");
    if (lk + pr !== penghuni)
      hints.push(`Laki-laki (${lk}) + perempuan (${pr}) = ${lk + pr}, belum sama dengan jumlah penghuni (${penghuni}).`);

    const wni = numVal("kewarganegaraanWni"), wna = numVal("kewarganegaraanWna");
    if (wni + wna !== penghuni)
      hints.push(`WNI (${wni}) + WNA (${wna}) = ${wni + wna}, belum sama dengan jumlah penghuni (${penghuni}).`);
  }

  if (penghuni <= 0) { box.innerHTML = ""; return; }
  if (hints.length === 0) {
    box.innerHTML = '<div class="hint ok"><span>✅</span><span>Semua total sudah cocok dengan jumlah penghuni.</span></div>';
  } else {
    box.innerHTML = hints.map((h) => `<div class="hint warn"><span>⚠️</span><span>${h}</span></div>`).join("");
  }
}

// ---------- Progress & tab ----------
function afterTabSwitch() {
  visitedTabs.add(currentTabIndex);

  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = ((currentTabIndex + 1) / TAB_ORDER.length) * 100 + "%";
  const lbl = document.getElementById("progressLabel");
  if (lbl) lbl.innerText = `Langkah ${currentTabIndex + 1} dari ${TAB_ORDER.length}`;
  const nm = document.getElementById("progressName");
  if (nm) nm.innerText = TAB_NAMES[currentTabIndex];

  document.querySelectorAll(".tab-btn").forEach((b, i) => {
    b.classList.toggle("done", visitedTabs.has(i) && i !== currentTabIndex);
  });

  const active = document.getElementById(TAB_ORDER[currentTabIndex]);
  document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("from-left"));
  if (active && lastDirection < 0) active.classList.add("from-left");

  document.querySelectorAll(".tab-btn")[currentTabIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

// ---------- Tombol +/- ----------
function initNumberSteppers() {
  const skip = ["paguAnggaran", "realisasiAnggaran"];
  document.querySelectorAll("#wbpForm input[type=number]").forEach((input) => {
    if (skip.includes(input.id) || input.parentElement.classList.contains("num-wrap")) return;

    const wrap = document.createElement("div");
    wrap.className = "num-wrap";
    input.parentNode.insertBefore(wrap, input);

    const minus = document.createElement("button");
    minus.type = "button"; minus.className = "num-btn minus"; minus.textContent = "−";
    minus.setAttribute("aria-label", "Kurangi");
    const plus = document.createElement("button");
    plus.type = "button"; plus.className = "num-btn plus"; plus.textContent = "+";
    plus.setAttribute("aria-label", "Tambah");

    wrap.append(minus, input, plus);

    const change = (delta) => {
      const next = Math.max(0, (Number(input.value) || 0) + delta);
      input.value = next;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    [[minus, -1], [plus, 1]].forEach(([btn, delta]) => {
      let timer = null, interval = null;
      const stop = () => { clearTimeout(timer); clearInterval(interval); };
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        change(delta);
        timer = setTimeout(() => { interval = setInterval(() => change(delta), 70); }, 400);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, stop));
      // Dukungan keyboard (Enter/Spasi)
      btn.addEventListener("click", (e) => { if (e.detail === 0) change(delta); });
    });
  });
}

// ---------- Interaksi form ----------
function initFormInteractions() {
  const form = document.getElementById("wbpForm");
  if (!form) return;

  // Cegah form ter-submit (reload) & Enter pindah ke kolom berikutnya
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.target.tagName !== "INPUT") return;
    e.preventDefault();
    const tab = e.target.closest(".tab-content");
    const fields = Array.from(tab.querySelectorAll("input:not(.num-btn)"));
    const i = fields.indexOf(e.target);
    if (i < fields.length - 1) {
      fields[i + 1].focus();
    } else if (currentTabIndex < TAB_ORDER.length - 1) {
      handleNextTab();
      setTimeout(() => document.getElementById(TAB_ORDER[currentTabIndex])?.querySelector("input")?.focus(), 60);
    }
  });

  // Seluruh isi kolom angka terpilih saat difokus (tidak perlu hapus "0")
  form.addEventListener("focusin", (e) => {
    if (e.target.matches("input[type=number]")) setTimeout(() => e.target.select(), 0);
  });

  // Geser kiri/kanan untuk pindah tab (HP)
  let sx = 0, sy = 0;
  form.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  form.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 80 && Math.abs(dy) < 50) {
      if (dx < 0) handleNextTab(); else handlePrevTab();
    }
  }, { passive: true });
}

// ---------- Ripple tombol ----------
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-custom");
  if (!btn || btn.disabled) return;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const span = document.createElement("span");
  span.className = "ripple";
  span.style.width = span.style.height = size + "px";
  span.style.left = e.clientX - r.left - size / 2 + "px";
  span.style.top = e.clientY - r.top - size / 2 + "px";
  btn.appendChild(span);
  setTimeout(() => span.remove(), 600);
});

// ---------- Confetti ----------
function launchConfetti() {
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#0d2b45"];
  for (let i = 0; i < 44; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[i % colors.length];
    c.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
    c.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    c.style.animationDelay = Math.random() * 0.3 + "s";
    c.style.animationDuration = 1.4 + Math.random() * 0.8 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2600);
  }
}

// ---------- Mode gelap ----------
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  const btn = document.getElementById("btnTheme");
  if (btn) btn.innerText = dark ? "☀️" : "🌙";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#0b1220" : "#0d2b45");
}

// ---------- Draf otomatis (hanya untuk tanggal yang sama) ----------
let draftTimer = null;
let restoring = false;
function scheduleDraftSave() {
  if (restoring) return;
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    const values = {};
    document.querySelectorAll("#wbpForm input, #wbpForm select").forEach((el) => {
      if (el.id && el.id !== "tanggal") values[el.id] = el.value;
    });
    lsSet("silasum_draft", JSON.stringify({ day: localDateString(), values }));
  }, 400);
}

function restoreDraft() {
  const raw = lsGet("silasum_draft");
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    if (draft.day !== localDateString()) { lsDel("silasum_draft"); return; }
    restoring = true;
    let restored = 0;
    Object.entries(draft.values).forEach(([id, v]) => {
      const el = document.getElementById(id);
      if (el && String(v) !== String(el.value)) { el.value = v; restored++; }
    });
    restoring = false;
    if (restored > 0) {
      updateInfographicValues();
      showToast("📝 Draf hari ini dipulihkan", "info");
    }
  } catch (e) { restoring = false; }
}

function resetForm() {
  if (!confirm("Kosongkan semua isian angka hari ini?")) return;
  document.querySelectorAll("#wbpForm input[type=number]").forEach((el) => (el.value = 0));
  lsDel("silasum_draft");
  updateInfographicValues();
  switchTab(0);
  showToast("🗑️ Form dikosongkan", "info");
}

// ---------- Inisialisasi tambahan ----------
document.addEventListener("DOMContentLoaded", () => {
  // Perbaikan: tanggal memakai waktu lokal (valueAsDate memakai UTC sehingga pagi hari WIB bisa mundur 1 hari)
  const dateInput = document.getElementById("tanggal");
  if (dateInput) dateInput.value = localDateString();

  initNumberSteppers();
  initFormInteractions();
  afterTabSwitch();

  applyTheme(lsGet("silasum_theme") === "dark");
  document.getElementById("btnTheme")?.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    applyTheme(dark);
    lsSet("silasum_theme", dark ? "dark" : "light");
  });
  document.getElementById("btnReset")?.addEventListener("click", resetForm);

  updateInfographicValues();
  restoreDraft();
});
