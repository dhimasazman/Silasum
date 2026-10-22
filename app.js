// URL Web App Google Apps Script
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxHjU1itJjBNQJQPlNUEAaM85Lcf8pFcMlvJd6MZowix2zNNPgC3njbrxyIakTl-7BT/exec";

// Daftar urutan tab
const TAB_ORDER = [
  "tab-umum",
  "tab-register",
  "tab-demografi",
  "tab-keterangan",
  "tab-pembinaan",
  "tab-anggaran",
];
let currentTabIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Set tanggal hari ini secara otomatis
  const today = new Date();
  document.getElementById("tanggal").valueAsDate = today;

  // Inisialisasi Tab & Navigasi Tombol
  initTabs();

  // Listener input untuk update otomatis ke infografis & indikator ringkasan
  document
    .getElementById("wbpForm")
    .addEventListener("input", updateInfographicValues);

  // Listener Tombol
  document.getElementById("btnNext").addEventListener("click", handleNextTab);
  document.getElementById("btnPrev").addEventListener("click", handlePrevTab);
  document
    .getElementById("btnSave")
    .addEventListener("click", handleSaveToSpreadsheet);
  document
    .getElementById("btnDownload")
    .addEventListener("click", handleDownloadImage);

  // Listener Tombol Share WA (jika elemen tersedia di HTML)
  const btnShareWa = document.getElementById("btnShareWa");
  if (btnShareWa) {
    btnShareWa.addEventListener("click", handleShareWhatsApp);
  }

  // Inisialisasi perhitungan & tampilan tombol awal
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
  document.getElementById(targetId).classList.add("active");

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

  // Tombol Kembali muncul dari Tahap 2 (index 1) ke atas
  if (btnPrev) btnPrev.style.display = currentTabIndex > 0 ? "flex" : "none";

  // Tahap 1-4 (index 0 - 3): Tampilkan Lanjutkan, Sembunyikan Simpan, Download, & Share WA
  if (currentTabIndex < TAB_ORDER.length - 1) {
    if (btnNext) btnNext.style.display = "flex";
    if (btnSave) btnSave.style.display = "none";
    if (btnDownload) btnDownload.style.display = "none";
    if (btnShareWa) btnShareWa.style.display = "none";
  } else {
    // Tahap 5 (index 4 - Tahap Pembinaan): Tampilkan Simpan, Download, & Share WA
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
    { in: "ketTeroris", out: "out-ketTeroris" },
    { in: "ketNarkoba", out: "out-ketNarkoba" },
    { in: "ketPsikotropika", out: "out-ketPsikotropika" },
    { in: "ketKesehatan", out: "out-ketKesehatan" },
    { in: "ketKorupsi", out: "out-ketKorupsi" },
    { in: "ketPidum", out: "out-ketPidum" },
    { in: "ketIlegalLogging", out: "out-ketIlegalLogging" },
    { in: "ketHumanTrafficking", out: "out-ketHumanTrafficking" },
    { in: "ketPidanaMati", out: "out-ketPidanaMati" },
    { in: "ketPidanaSH", out: "out-ketPidanaSH" },
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

  const rawDate = document.getElementById("tanggal").value;
  document.getElementById("out-tanggal").innerText =
    formatDateIndonesian(rawDate);

  mappings.forEach((item) => {
    const inputEl = document.getElementById(item.in);
    const outEl = document.getElementById(item.out);
    if (inputEl && outEl) {
      outEl.innerText = inputEl.value || 0;
    }
  });

  document.getElementById("out-totalRegA").innerText = totalRegA;
  document.getElementById("out-totalRegB").innerText = totalRegB;

  // Update Ringkasan Stat Atas
  const kap = Number(document.getElementById("kapasitas").value || 0);
  const penghuni = Number(document.getElementById("jumlahPenghuni").value || 0);
  const persen = kap > 0 ? Math.round((penghuni / kap) * 100) : 0;

  document.getElementById("card-kapasitas").innerText = kap;
  document.getElementById("card-penghuni").innerText = penghuni;
  document.getElementById("card-persen").innerText = persen + "%";

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
}

// Simpan ke Spreadsheet
async function handleSaveToSpreadsheet() {
  const btn = document.getElementById("btnSave");
  const icon = btn.querySelector(".btn-icon");
  const text = btn.querySelector(".btn-text");

  btn.disabled = true;
  icon.innerHTML = '<span class="spinner"></span>';
  text.innerText = "Menyimpan...";

  try {
    const inputs = document.querySelectorAll("input");
    const formData = {};
    inputs.forEach((input) => {
      formData[input.id] = input.value || 0;
    });

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    btn.classList.add("btn-state-success");
    icon.innerText = "✓";
    text.innerText = "Berhasil Disimpan!";
    showToast("✅ Data berhasil dikirim ke Google Spreadsheet!", "success");
  } catch (err) {
    showToast("❌ Gagal menyimpan data: " + err.message, "error");
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove("btn-state-success");
      icon.innerText = "💾";
      text.innerText = "Simpan ke Spreadsheet";
    }, 2500);
  }
}

// Unduh Gambar Infografis
async function handleDownloadImage() {
  const btn = document.getElementById("btnDownload");
  const icon = btn.querySelector(".btn-icon");
  const text = btn.querySelector(".btn-text");

  btn.disabled = true;
  icon.innerHTML = '<span class="spinner"></span>';
  text.innerText = "Memproses Gambar...";

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
    const dateVal = document.getElementById("tanggal").value || "Laporan";
    link.download = `Laporan_Harian_WBP_${dateVal}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    btn.classList.add("btn-state-success");
    icon.innerText = "✓";
    text.innerText = "Gambar Diunduh!";
    showToast("🖼️ Gambar infografis berhasil diunduh!", "success");
  } catch (err) {
    showToast("❌ Gagal mengunduh gambar: " + err.message, "error");
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove("btn-state-success");
      icon.innerText = "🖼️";
      text.innerText = "Unduh Gambar";
    }, 2500);
  }
}

// Share Gambar & Teks ke WhatsApp
async function handleShareWhatsApp() {
  const btn = document.getElementById("btnShareWa");
  const icon = btn.querySelector(".btn-icon");
  const text = btn.querySelector(".btn-text");

  btn.disabled = true;
  icon.innerHTML = '<span class="spinner"></span>';
  text.innerText = "Memproses...";

  try {
    updateInfographicValues();

    // 1. Susun Teks Ringkasan Pesan
    const tgl = formatDateIndonesian(document.getElementById("tanggal").value);
    const kap = document.getElementById("kapasitas").value || 0;
    const penghuni = document.getElementById("jumlahPenghuni").value || 0;
    const didalam = document.getElementById("diDalamLapas").value || 0;
    const diluar = document.getElementById("diLuarLapas").value || 0;
    const m13 = document.getElementById("m13").value || 0;
    const m12 = document.getElementById("m12").value || 0;
    const m23 = document.getElementById("m23").value || 0;

    const captionText = `*LAPORAN HARIAN SILASUM*
🏛️ *Lapas Kelas IIB Sumedang*
📅 *Tanggal:* ${tgl}

📊 *INFORMASI UMUM*
- Kapasitas: ${kap} Orang
- Jumlah Penghuni: ${penghuni} Orang
- Di Dalam Lapas: ${didalam} Orang
- Di Luar Lapas: ${diluar} Orang

🕒 *TAHAP PEMBINAAN*
- ⅓ Masa Pidana: ${m13} Orang
- ½ Masa Pidana: ${m12} Orang
- ⅔ Masa Pidana: ${m23} Orang`;

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

    // Format angka ke format mata uang Rupiah
    function formatRupiah(angka) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(angka || 0);
    }

    // Di dalam fungsi updateInfographicValues():
    function updateInfographicValues() {
      // ... kode perhitungan existing ...

      // Update Realisasi Anggaran Dinamis
      const tahun = document.getElementById("tahunAnggaran")
        ? document.getElementById("tahunAnggaran").value
        : "2026";
      const pagu = Number(
        document.getElementById("paguAnggaran")
          ? document.getElementById("paguAnggaran").value
          : 0,
      );
      const realisasi = Number(
        document.getElementById("realisasiAnggaran")
          ? document.getElementById("realisasiAnggaran").value
          : 0,
      );

      const persentase =
        pagu > 0 ? ((realisasi / pagu) * 100).toFixed(2) : "0,00";

      if (document.getElementById("out-tahunAnggaran")) {
        document.getElementById("out-tahunAnggaran").innerText = tahun;
      }
      if (document.getElementById("out-paguAnggaran")) {
        document.getElementById("out-paguAnggaran").innerText =
          formatRupiah(pagu);
      }
      if (document.getElementById("out-realisasiAnggaran")) {
        document.getElementById("out-realisasiAnggaran").innerText =
          formatRupiah(realisasi);
      }
      if (document.getElementById("out-persentaseAnggaran")) {
        document.getElementById("out-persentaseAnggaran").innerText =
          persentase.replace(".", ",") + "%";
      }
    }

    // 3. Konversi Canvas ke File Blob
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    const dateVal = document.getElementById("tanggal").value || "WBP";
    const file = new File([blob], `Laporan_Harian_${dateVal}.png`, {
      type: "image/png",
    });

    // 4. Jika Perangkat Mendukung Native File Share (HP/Tablet)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Laporan Harian Lapas Sumedang",
        text: captionText,
      });
      showToast("📲 Berhasil membuka menu berbagi!", "success");
    } else {
      // Fallback untuk Browser Desktop/Laptop
      await navigator.clipboard.writeText(captionText);
      const encodedText = encodeURIComponent(captionText);
      window.open(
        `https://api.whatsapp.com/send?text=${encodedText}`,
        "_blank",
      );
      showToast(
        "📋 Teks disalin! Gambar diunduh otomatis untuk Anda lampirkan di WA.",
        "info",
      );

      // Otomatis unduh gambar untuk diunggah manual di WA Web
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
      icon.innerText = "📲";
      text.innerText = "Share ke WA";
    }, 1500);
  }
}
