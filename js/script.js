// Ganti dengan URL Web App dari DEPLOYMENT Google Apps Script ANDA
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzy9XpILVWqQ2TkLXnC7x8-QDI9e4UGiwMJdjUtUH4HnSnj9f0Z7IdkfL6-U-MyTxEWDQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  const quizSection = document.getElementById("latihan-soal");
  if (quizSection) {
    initializeQuiz();
  }
});

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

function initializeQuiz() {
  const optionLetters = ["A", "B", "C", "D", "E"];
  let userAnswers = [],
    currentScore = 0,
    selectedQuestions = [],
    timerInterval,
    timeLeft = 600;

  const quizSection = document.getElementById("latihan-soal");
  const quizContainer = document.getElementById("quiz-container");
  const checkAnswersBtn = document.getElementById("check-answers-btn");
  const retakeQuizBtn = document.getElementById("retake-quiz-btn");
  const quizResults = document.getElementById("quiz-results");
  const scoreText = document.getElementById("score-text");
  const nameInput = document.getElementById("user-name");
  const timerDiv = document.getElementById("timer");
  const timerModal = document.getElementById("timer-modal");
  const timerYesBtn = document.getElementById("timer-yes");
  const timerNoBtn = document.getElementById("timer-no");

  function startQuiz() {
    timerModal.classList.add("hidden");
    quizSection.classList.remove("hidden");
    renderQuiz();
    startTimer();
  }

  function startTimer() {
    timeLeft = 300; // 10 menit
    timerDiv.classList.remove("hidden");
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerDiv.textContent = "Waktu Habis!";
        checkAnswers(true); // Paksa submit saat waktu habis
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");
    timerDiv.textContent = `Sisa Waktu: ${min}:${sec}`;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function renderQuiz() {
    selectedQuestions = (window.quizQuestions || []).slice();
    shuffleArray(selectedQuestions);
    selectedQuestions = selectedQuestions.slice(0, 10);
    userAnswers = Array(selectedQuestions.length).fill(null);
    quizContainer.innerHTML = "";
    selectedQuestions.forEach((q, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.className =
        "bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100";
      questionDiv.innerHTML = `
                <p class="font-semibold text-lg mb-4 text-blue-900">${
                  index + 1
                }. ${q.question}</p>
                <div class="options-container space-y-3">
                    ${q.options
                      .map(
                        (option, optIndex) =>
                          `<label class="quiz-option" data-question-index="${index}" data-option-index="${optIndex}"><input type="radio" name="question-${index}" value="${optIndex}" class="hidden"><span class="option-letter">${optionLetters[optIndex]}.</span><span class="ml-2">${option}</span></label>`
                      )
                      .join("")}
                </div>`;
      quizContainer.appendChild(questionDiv);
    });
    document.querySelectorAll(".quiz-option").forEach((label) =>
      label.addEventListener("click", function () {
        if (checkAnswersBtn.disabled) return;
        const qIndex = parseInt(this.dataset.questionIndex),
          oIndex = parseInt(this.dataset.optionIndex);
        document
          .querySelectorAll(`.quiz-option[data-question-index="${qIndex}"]`)
          .forEach((prev) => prev.classList.remove("selected"));
        this.classList.add("selected");
        this.querySelector("input").checked = true;
        userAnswers[qIndex] = oIndex;
      })
    );
    quizResults.classList.add("hidden");
    checkAnswersBtn.classList.remove("hidden");
    retakeQuizBtn.classList.add("hidden");
    currentScore = 0;
    nameInput.value = ""; // Kosongkan nama saat ulangi
    validateName();
  }

  function checkAnswers(forceSubmit = false) {
    clearInterval(timerInterval);
    const timeTaken = 600 - timeLeft;
    const userName = nameInput.value.trim();
    currentScore = 0;

    if (!userName) {
      showAlert("Harap masukkan nama Anda terlebih dahulu!", false);
      return;
    }
    if (!forceSubmit && userAnswers.includes(null)) {
      showAlert("Harap jawab semua pertanyaan!", false);
      return;
    }

    userAnswers.forEach((answer, index) => {
      if (answer !== null && answer === selectedQuestions[index].answer) {
        currentScore++;
      }
    });

    document
      .querySelectorAll(".quiz-option")
      .forEach((label) => (label.style.pointerEvents = "none"));
    checkAnswersBtn.disabled = true;
    checkAnswersBtn.textContent = "Menyimpan...";

    const formData = new FormData();
    formData.append("nama", userName);
    formData.append("score", currentScore);
    formData.append("total", selectedQuestions.length);
    formData.append("waktu", timeTaken);

    fetch(SCRIPT_URL, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        console.log("Success:", data);
        showAlert("Hasil berhasil disimpan!");
      })
      .catch((error) => {
        console.error("Error:", error);
        showAlert("Gagal menyimpan hasil, coba lagi.", false);
      })
      .finally(() => {
        let nameDisplay = userName ? `Hai, ${userName}! ` : "";
        scoreText.textContent = `${nameDisplay}Anda menjawab benar ${currentScore} dari ${selectedQuestions.length} soal.`;
        quizResults.classList.remove("hidden");
        checkAnswersBtn.classList.add("hidden");
        checkAnswersBtn.textContent = "Cek Jawaban";
        retakeQuizBtn.classList.remove("hidden");
        quizResults.scrollIntoView({ behavior: "smooth" });
      });
  }

  function validateName() {
    if (nameInput.value.trim() !== "") {
      checkAnswersBtn.disabled = false;
      checkAnswersBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      checkAnswersBtn.disabled = true;
      checkAnswersBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }

  // --- Inisialisasi Event Listeners ---
  timerYesBtn.addEventListener("click", startQuiz);
  timerNoBtn.addEventListener("click", () => {
    window.location.href = "/";
  });
  retakeQuizBtn.addEventListener("click", () => {
    quizSection.classList.add("hidden");
    timerModal.classList.remove("hidden");
    timerDiv.classList.add("hidden");
  });
  checkAnswersBtn.addEventListener("click", () => checkAnswers(false));
  nameInput.addEventListener("input", validateName);

  // Inisialisasi awal
  validateName();
}
