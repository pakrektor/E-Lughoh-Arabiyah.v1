// Ganti dengan URL Web App dari DEPLOYMENT Google Apps Script ANDA
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxyLlCnurQKJgA9yGNT5jd2Yw7HUZBFvISwqETP2dohEZqp-Fd9kO00LFA0unMSq5XZLw/exec";

// Fungsi notifikasi
function showAlert(message, isSuccess = true) {
  const customAlert = document.getElementById("custom-alert");
  if (!customAlert) return;
  customAlert.textContent = message;
  customAlert.style.backgroundColor = isSuccess ? "#28a745" : "#dc3545";
  customAlert.classList.remove("hidden");
  customAlert.classList.add("show");
  setTimeout(() => {
    customAlert.classList.remove("show");
    setTimeout(() => {
      customAlert.classList.add("hidden");
    }, 500);
  }, 3000);
}

// Fungsi utama untuk memuat dan menampilkan diskusi
async function loadDiscussions() {
  const container = document.getElementById("container-diskusi");
  container.innerHTML = `<p class="text-center text-gray-500">Memuat diskusi...</p>`;

  try {
    const response = await fetch(`${SCRIPT_URL}?action=getDiscussions`);
    if (!response.ok) throw new Error("Gagal mengambil data.");

    const discussions = await response.json();
    container.innerHTML = ""; // Kosongkan container

    if (discussions.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500">Belum ada diskusi. Jadilah yang pertama bertanya!</p>`;
    } else {
      discussions.reverse().forEach((thread) => {
        const threadDiv = document.createElement("div");
        threadDiv.className = "border border-gray-200 rounded-lg p-5";

        const answersHTML = (thread.jawaban || [])
          .map(
            (ans) => `
                        <div class="ml-8 mt-3 p-3 bg-gray-50 rounded-md border-l-4 border-blue-300">
                            <p class="text-gray-800">${ans.isi}</p>
                            <p class="text-xs text-gray-500 mt-1">Dijawab oleh: <strong>${
                              ans.nama
                            }</strong> pada ${new Date(
              ans.waktu
            ).toLocaleDateString("id-ID")}</p>
                        </div>
                    `
          )
          .join("");

        threadDiv.innerHTML = `
                    <div class="flex justify-between items-start">
                        <h4 class="text-lg font-bold text-blue-800">${
                          thread.judul
                        }</h4>
                        <span class="text-xs text-gray-500 whitespace-nowrap">${new Date(
                          thread.waktu
                        ).toLocaleDateString("id-ID")}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">Ditanya oleh: <strong>${
                      thread.nama
                    }</strong></p>
                    <p class="text-gray-800 mb-4">${thread.pertanyaan}</p>
                    
                    <div class="answers-section">
                        <h5 class="text-sm font-semibold mb-2 ${
                          answersHTML ? "" : "hidden"
                        }">Jawaban:</h5>
                        ${answersHTML}
                    </div>

                    <div class="mt-4">
                        <button class="toggle-reply-form text-sm text-blue-600 hover:underline">Balas</button>
                        <form class="reply-form hidden mt-2" data-thread-id="${
                          thread.id
                        }">
                            <div class="mb-2">
                                <label class="text-sm font-medium">Nama Anda:</label>
                                <input type="text" name="nama" class="w-full text-sm border rounded p-1" required>
                            </div>
                            <div class="mb-2">
                                <label class="text-sm font-medium">Jawaban Anda:</label>
                                <textarea name="jawaban" rows="2" class="w-full text-sm border rounded p-1" required></textarea>
                            </div>
                            <button type="submit" class="bg-blue-500 text-white text-sm py-1 px-3 rounded hover:bg-blue-600">Kirim Balasan</button>
                        </form>
                    </div>
                `;
        container.appendChild(threadDiv);
      });
    }
  } catch (error) {
    container.innerHTML = `<p class="text-center text-red-500">Gagal memuat diskusi. Coba muat ulang halaman.</p>`;
    console.error("Error loading discussions:", error);
  }
}

// Fungsi untuk mengirim pertanyaan baru
async function postQuestion(e) {
  e.preventDefault();
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";

  const formData = new FormData(form);
  formData.append("action", "postQuestion");

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Gagal mengirim pertanyaan.");

    const result = await response.json();
    if (result.result === "success") {
      showAlert("Pertanyaan berhasil dikirim!");
      form.reset();
      loadDiscussions(); // Muat ulang diskusi untuk menampilkan yang baru
    } else {
      throw new Error(result.error || "Terjadi kesalahan.");
    }
  } catch (error) {
    showAlert("Gagal mengirim pertanyaan. Coba lagi.", false);
    console.error("Error posting question:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kirim Pertanyaan";
  }
}

// Fungsi untuk mengirim balasan
async function postReply(e) {
  e.preventDefault();
  const form = e.target;
  const threadId = form.dataset.threadId;
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";

  const formData = new FormData(form);
  formData.append("action", "postReply");
  formData.append("threadId", threadId);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Gagal mengirim balasan.");

    const result = await response.json();
    if (result.result === "success") {
      showAlert("Balasan berhasil dikirim!");
      loadDiscussions(); // Cukup muat ulang semua diskusi
    } else {
      throw new Error(result.error || "Terjadi kesalahan.");
    }
  } catch (error) {
    showAlert("Gagal mengirim balasan. Coba lagi.", false);
    console.error("Error posting reply:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kirim Balasan";
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadDiscussions();

  const newQuestionForm = document.getElementById("form-pertanyaan-baru");
  if (newQuestionForm) {
    newQuestionForm.addEventListener("submit", postQuestion);
  }

  // Event delegation untuk form balasan dan tombol toggle
  const discussionContainer = document.getElementById("container-diskusi");
  if (discussionContainer) {
    discussionContainer.addEventListener("click", function (e) {
      // Toggle form balasan
      if (e.target.classList.contains("toggle-reply-form")) {
        e.preventDefault();
        const form = e.target.nextElementSibling;
        form.classList.toggle("hidden");
      }
    });

    discussionContainer.addEventListener("submit", function (e) {
      // Submit form balasan
      if (e.target.classList.contains("reply-form")) {
        postReply(e);
      }
    });
  }
});
