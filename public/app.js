const EMAILJS_CONFIG = {
  publicKey: "REPLACE_WITH_EMAILJS_PUBLIC_KEY",
  serviceId: "REPLACE_WITH_EMAILJS_SERVICE_ID",
  templateId: "REPLACE_WITH_EMAILJS_TEMPLATE_ID",
  toEmail: "you@example.com"
};

const MAX_GUESTS = 6;

const guestFields = document.getElementById("guestFields");
const guestForm = document.getElementById("guestForm");
const statusMessage = document.getElementById("statusMessage");
const configWarning = document.getElementById("configWarning");
const submitButton = document.getElementById("submitButton");
const startDateText = document.getElementById("startDateText");
const endDateText = document.getElementById("endDateText");
const exampleLink = document.getElementById("exampleLink");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function createGuestCard(index) {
  return `
    <section class="guest-card">
      <div class="guest-card-head">
        <h2>Guest ${index}</h2>
        <p>${index === 1 ? "Required" : "Optional"}</p>
      </div>

      <div class="guest-grid">
        <label>
          <span>First name</span>
          <input type="text" name="first_name_${index}" ${index === 1 ? "required" : ""} />
        </label>

        <label>
          <span>Surname</span>
          <input type="text" name="surname_${index}" ${index === 1 ? "required" : ""} />
        </label>

        <label>
          <span>ID / passport number</span>
          <input type="text" name="document_id_${index}" ${index === 1 ? "required" : ""} />
        </label>

        <label>
          <span>Nationality</span>
          <input type="text" name="nationality_${index}" ${index === 1 ? "required" : ""} />
        </label>
      </div>
    </section>
  `;
}

function renderGuestCards() {
  const cards = [];

  for (let index = 1; index <= MAX_GUESTS; index += 1) {
    cards.push(createGuestCard(index));
  }

  guestFields.innerHTML = cards.join("");
}

function getStayParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    start: params.get("start") || "",
    end: params.get("end") || ""
  };
}

function updateStaySummary() {
  const { start, end } = getStayParams();

  startDateText.textContent = formatDate(start);
  endDateText.textContent = formatDate(end);

  const exampleUrl = `${window.location.origin}${window.location.pathname}?start=2026-06-01&end=2026-06-07`;
  exampleLink.textContent = exampleUrl;
}

function readGuests(formData) {
  const guests = [];

  for (let index = 1; index <= MAX_GUESTS; index += 1) {
    const firstName = String(formData.get(`first_name_${index}`) || "").trim();
    const surname = String(formData.get(`surname_${index}`) || "").trim();
    const documentId = String(formData.get(`document_id_${index}`) || "").trim();
    const nationality = String(formData.get(`nationality_${index}`) || "").trim();
    const hasAnyValue = Boolean(firstName || surname || documentId || nationality);

    if (!hasAnyValue) {
      continue;
    }

    if (!firstName || !surname || !documentId || !nationality) {
      throw new Error(`Guest ${index} must have all fields filled in.`);
    }

    guests.push({
      slot: index,
      firstName,
      surname,
      documentId,
      nationality
    });
  }

  if (!guests.length) {
    throw new Error("Please add at least one guest.");
  }

  return guests;
}

function guestsToHtml(guests) {
  return guests
    .map(
      (guest) => `
        <tr>
          <td>${guest.slot}</td>
          <td>${escapeHtml(guest.firstName)}</td>
          <td>${escapeHtml(guest.surname)}</td>
          <td>${escapeHtml(guest.documentId)}</td>
          <td>${escapeHtml(guest.nationality)}</td>
        </tr>
      `
    )
    .join("");
}

function guestsToText(guests) {
  return guests
    .map(
      (guest) =>
        `Guest ${guest.slot}: ${guest.firstName} ${guest.surname}, ID ${guest.documentId}, Nationality ${guest.nationality}`
    )
    .join("\n");
}

function setStatus(kind, message) {
  statusMessage.hidden = false;
  statusMessage.className = `notice ${kind}`;
  statusMessage.textContent = message;
}

function isEmailConfigured() {
  return !Object.values(EMAILJS_CONFIG).some((value) => value.startsWith("REPLACE_WITH"));
}

async function sendEmail(event) {
  event.preventDefault();

  try {
    const formData = new FormData(guestForm);
    const guests = readGuests(formData);
    const stay = getStayParams();

    submitButton.disabled = true;
    setStatus("info", "Sending details...");

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        to_email: EMAILJS_CONFIG.toEmail,
        start_date: stay.start || "Not provided",
        end_date: stay.end || "Not provided",
        guest_count: String(guests.length),
        guests_text: guestsToText(guests),
        guests_html: `
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
            <thead>
              <tr>
                <th>Guest</th>
                <th>First name</th>
                <th>Surname</th>
                <th>ID</th>
                <th>Nationality</th>
              </tr>
            </thead>
            <tbody>
              ${guestsToHtml(guests)}
            </tbody>
          </table>
        `
      },
      {
        publicKey: EMAILJS_CONFIG.publicKey
      }
    );

    guestForm.reset();
    setStatus("success", "Guest details sent successfully.");
  } catch (error) {
    setStatus("error", error.message || "Could not send the email.");
  } finally {
    submitButton.disabled = false;
  }
}

function init() {
  renderGuestCards();
  updateStaySummary();

  if (!isEmailConfigured()) {
    configWarning.hidden = false;
  } else {
    emailjs.init({
      publicKey: EMAILJS_CONFIG.publicKey
    });
  }

  guestForm.addEventListener("submit", sendEmail);
}

init();
