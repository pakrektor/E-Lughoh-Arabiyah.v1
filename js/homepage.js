// js/homepage.js

// Ganti dengan URL Web App dari DEPLOYMENT Google Apps Script ANDA
const SPREADSHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbxrRx1qsy35q7OoRLqAmeg-vCuVJpJ0PxQiW3F4Qz7jP3dvTmeZQRCtoHsjGbyvy7wW5A/exec";

// Pastikan skrip berjalan setelah seluruh halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("hasil-latihan");
  if (!container) return; // Hentikan jika elemen tidak ditemukan

  // 1. Tampilkan pesan "Memuat data..."
  container.innerHTML = `<p class="text-center text-gray-500">Memuat data terbaru...</p>`;

  // 2. Lakukan permintaan data ke Google Sheets
  fetch(SPREADSHEET_API_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Gagal mengambil data dari server.");
      }
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.length > 0) {
        // Urutkan data berdasarkan timestamp (waktu) terbaru, lalu ambil 10 teratas
        const hasilTerbaru = data
          .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
          .slice(0, 10);

        // Buat struktur tabel HTML
        let tableHTML = `
                      <div class="overflow-x-auto">
                          <table class="min-w-full text-sm text-left border-collapse">
                              <thead class="bg-blue-50">
                                  <tr>
                                      <th class="px-4 py-2 border-b-2 border-blue-200 font-semibold text-blue-800">Tanggal</th>
                                      <th class="px-4 py-2 border-b-2 border-blue-200 font-semibold text-blue-800">Nama</th>
                                      <th class="px-4 py-2 border-b-2 border-blue-200 font-semibold text-blue-800">Skor</th>
                                      <th class="px-4 py-2 border-b-2 border-blue-200 font-semibold text-blue-800">Waktu Pengerjaan</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${hasilTerbaru
                                    .map((item) => {
                                      // --- LOGIKA UNTUK FORMAT TANGGAL ---
                                      const submissionDate = new Date(
                                        item.waktu
                                      );
                                      const formattedDate =
                                        submissionDate.toLocaleDateString(
                                          "id-ID",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          }
                                        );

                                      // --- LOGIKA BARU YANG LEBIH ROBUST UNTUK KONVERSI WAKTU ---
                                      let displayTime;
                                      const waktu = item.waktuPengerjaan;

                                      // Cek apakah data waktu tidak mengandung ':'
                                      // Jika tidak, maka itu adalah data lama (total detik) yang perlu dikonversi.
                                      if (
                                        String(waktu).indexOf(":") === -1 &&
                                        !isNaN(waktu)
                                      ) {
                                        const totalSeconds = parseInt(
                                          waktu,
                                          10
                                        );
                                        const minutes = Math.floor(
                                          totalSeconds / 60
                                        );
                                        const seconds = totalSeconds % 60;
                                        displayTime = `${String(
                                          minutes
                                        ).padStart(2, "0")}:${String(
                                          seconds
                                        ).padStart(2, "0")}`;
                                      } else {
                                        // Jika sudah mengandung ':', berarti sudah dalam format MM:SS
                                        displayTime = waktu;
                                      }
                                      // ---------------------------------------------------------

                                      return `
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-2 border-b border-gray-200 whitespace-nowrap">${formattedDate}</td>
                                            <td class="px-4 py-2 border-b border-gray-200">${
                                              item.nama || "-"
                                            }</td>
                                            <td class="px-4 py-2 border-b border-gray-200">${
                                              item.score !== undefined
                                                ? `${item.score} / ${item.total}`
                                                : "-"
                                            }</td>
                                            <td class="px-4 py-2 border-b border-gray-200">${
                                              displayTime || "N/A"
                                            }</td>
                                        </tr>
                                      `;
                                    })
                                    .join("")}
                              </tbody>
                          </table>
                      </div>
                    `;
        container.innerHTML = tableHTML;
      } else {
        container.innerHTML = `<p class="text-center text-gray-500">Belum ada data latihan.</p>`;
      }
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
      container.innerHTML = `<p class="text-center text-red-500">Gagal memuat data. Silakan coba lagi nanti.</p>`;
    });
});
