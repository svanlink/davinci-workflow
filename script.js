const workflowData = {
  dwg: {
    preclipDesc: "Infrastructure before the clip-level grade.",
    clipDesc: "Per-shot grading zone. Balance first, then style.",
    postclipDesc: "Output, limiting, and measurement.",

    node01Kind: "Input",
    node01Title: "Input CST",
    node01Purpose: "Normalize FX3 footage into DWG / Intermediate.",
    node01Note: "Sony S-Gamut3.Cine / S-Log3 → DWG / Intermediate.",

    node02Purpose: "Clean the signal before contrast amplification.",
    node02Note: "Usually subtle or bypassed at clean base ISOs.",

    node03Purpose: "Set overall luminance and place the shot correctly.",
    node03Note: "Use Offset first. Normalize before styling.",

    node04Purpose: "Correct temperature and tint once exposure is in place.",
    node04Note: "Measure late, correct early.",

    node05Purpose: "Build tonal shape after technical balance.",
    node05Note: "Curves or HDR Wheels. Primaries are safe here.",

    node06Purpose: "Set global color intensity after tonal balance.",
    node06Note: "Keep separate from contrast for clarity.",

    node07Purpose: "Protect and refine faces independently.",
    node07Note: "Qualifier or HDR light-zone approach.",

    node08Purpose: "Sky, foliage, wardrobe, products, local fixes.",
    node08Note: "Targeted selections, not broad rescue moves.",

    node09Purpose: "Apply the aesthetic finish once the shot already works.",
    node09Note: "This is for style, not technical repair.",

    node10Purpose: "Final compositional shaping and attention control.",
    node10Note: "Keep it subtle and nearly invisible.",

    node11Title: "Output CST",
    node11Purpose: "Convert DWG / Intermediate to Rec.709 for delivery.",
    node11Note: "Tone Mapping: DaVinci. Max Input Nits: 1000.",

    node12Purpose: "Legalize or soft-clip the final Rec.709 signal.",
    node12Note: "Must live after the Output CST.",

    node13Purpose: "Final signal measurement only.",
    node13Note: "Read here, correct back on Node 04."
  },

  logc: {
    preclipDesc: "Infrastructure before the clip-level grade.",
    clipDesc: "The grade now lives inside ARRI LogC4. Tools respond differently.",
    postclipDesc: "Output, limiting, and Rec.709 measurement.",

    node01Kind: "Input",
    node01Title: "ColorClone",
    node01Purpose: "Convert the FX3 image directly to ARRI WG4 / LogC4.",
    node01Note: "No CST before this node. This is the transform.",

    node02Purpose: "Same sensor-cleanup logic as the DWG workflow.",
    node02Note: "The camera is still the FX3, despite the new space.",

    node03Purpose: "Place the shot correctly inside LogC4.",
    node03Note: "Use Offset first. Normalize before styling.",

    node04Purpose: "Correct temp and tint after the clone transform.",
    node04Note: "Node 13 measures. Node 04 corrects.",

    node05Purpose: "Shape tone using the right tool for LogC4.",
    node05Note: "HDR Wheels preferred / required.",

    node06Purpose: "Set global color intensity once the shot is balanced.",
    node06Note: "Color behavior will feel different from DWG.",

    node07Purpose: "Refine faces inside ARRI-style color science.",
    node07Note: "Pipeline value often becomes evident here.",

    node08Purpose: "Isolated color work: sky, foliage, products, issues.",
    node08Note: "The job is the same. The underlying math is not.",

    node09Purpose: "Apply the project's final mood and finish.",
    node09Note: "You are already grading inside ARRI working space.",

    node10Purpose: "Final attention control and framing polish.",
    node10Note: "Keep the falloff soft and deliberate.",

    node11Title: "Output CST",
    node11Purpose: "Convert LogC4 to Rec.709 for delivery.",
    node11Note: "ARRI WG4 / LogC4 → Rec.709. Max Nits: 10000.",

    node12Purpose: "Limit or legalize the finished display-referred signal.",
    node12Note: "Retag to Rec.709 if needed for correct scopes.",

    node13Purpose: "Final measurement of the Rec.709 result.",
    node13Note: "Retag to Rec.709 if needed. Never correct here."
  }
};

const htmlEl = document.documentElement;
const board = document.getElementById("board");
const workflowButtons = document.querySelectorAll("[data-workflow]");
const themeButtons = document.querySelectorAll("[data-theme-target]");
const navLinks = Array.from(document.querySelectorAll(".doc-nav-link"));
const revealSections = Array.from(document.querySelectorAll(".reveal"));

function updateWorkflow(workflow) {
  const data = workflowData[workflow];
  board.classList.remove("dwg", "logc");
  board.classList.add(workflow);
  board.classList.add("board-flash");
  window.setTimeout(() => board.classList.remove("board-flash"), 420);

  Object.entries(data).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  workflowButtons.forEach((btn) => {
    const isActive = btn.dataset.workflow === workflow;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  localStorage.setItem("fx3-workflow", workflow);
}

function updateTheme(theme) {
  htmlEl.setAttribute("data-theme", theme);
  themeButtons.forEach((btn) => {
    const isActive = btn.dataset.themeTarget === theme;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  localStorage.setItem("fx3-theme", theme);
}

workflowButtons.forEach((btn) => {
  btn.addEventListener("click", () => updateWorkflow(btn.dataset.workflow));
});

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => updateTheme(btn.dataset.themeTarget));
});

revealSections.forEach((section, index) => {
  section.style.setProperty("--reveal-delay", String(index * 90));
});

function setActiveLink(id) {
  navLinks.forEach(link => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isActive);
  });
}

const sections = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.replace("#", "");
    const el = id ? document.getElementById(id) : null;
    return el ? { link, el } : null;
  })
  .filter(Boolean);

let activeSection = "overview";
const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (visible.length > 0) {
    activeSection = visible[0].target.id;
    setActiveLink(activeSection);
  }
}, {
  rootMargin: "-30% 0px -52% 0px",
  threshold: [0.1, 0.25, 0.45, 0.65]
});

sections.forEach(({ el }) => observer.observe(el));

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href")?.replace("#", "");
    if (id) setActiveLink(id);
  });
});

const savedWorkflow = localStorage.getItem("fx3-workflow") || "dwg";
const savedTheme = localStorage.getItem("fx3-theme") || "dark";

updateWorkflow(savedWorkflow);
updateTheme(savedTheme);
setActiveLink(activeSection);

window.requestAnimationFrame(() => {
  document.body.classList.add("page-ready");
});
