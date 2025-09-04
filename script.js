import { supabase } from "./supabaseClient.js";

const editBtn = document.getElementById("editModeBtn");
const editorPanel = document.getElementById("editorPanel");
const saveEdit = document.getElementById("saveEdit");
const editContent = document.getElementById("editContent");

let currentSection = null;

// Modo edición
editBtn.addEventListener("click", () => {
  document.querySelectorAll("[data-section]").forEach((el) => {
    el.addEventListener("click", () => {
      currentSection = el.getAttribute("data-section");
      editContent.value = el.innerText;
      editorPanel.hidden = false;
    });
  });
});

// Guardar cambios en Supabase
saveEdit.addEventListener("click", async () => {
  if (!currentSection) return;
  const { error } = await supabase
    .from("paginas")
    .update({ contenido: editContent.value })
    .eq("seccion", currentSection);

  if (!error) {
    document.getElementById(currentSection).innerText = editContent.value;
    alert("✅ Guardado en Supabase");
  } else {
    console.error(error);
  }
});

// Cargar contenido inicial
async function loadContent() {
  const { data } = await supabase.from("paginas").select("*");
  data.forEach((row) => {
    const el = document.getElementById(row.seccion);
    if (el) el.innerText = row.contenido;
  });
}
loadContent();

// Escuchar cambios en tiempo real
supabase
  .channel("paginas-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "paginas" }, (payload) => {
    const el = document.getElementById(payload.new.seccion);
    if (el) el.innerText = payload.new.contenido;
  })
  .subscribe();
