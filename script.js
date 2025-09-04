import { supabase } from "./supabaseClient.js";

const editBtn = document.getElementById("editModeBtn");
const editorPanel = document.getElementById("editorPanel");
const saveEdit = document.getElementById("saveEdit");
const editContent = document.getElementById("editContent");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const username = document.getElementById("username");
const loginModal = document.getElementById("loginModal");
const doLogin = document.getElementById("doLogin");
const closeLogin = document.getElementById("closeLogin");

let currentSection = null;
let userRole = "usuario";

// Mostrar modal login
loginBtn.addEventListener("click", () => {
  loginModal.hidden = false;
});

closeLogin.addEventListener("click", () => {
  loginModal.hidden = true;
});

// Login con Supabase
doLogin.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert("❌ Error: " + error.message);
    return;
  }

  const { data: userData } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", data.user.id)
    .single();

  userRole = userData?.role || "usuario";

  username.hidden = false;
  username.innerText = email;
  loginBtn.hidden = true;
  logoutBtn.hidden = false;

  // Mostrar botón editar solo si es admin/tecnico
  if (["admin", "tecnico"].includes(userRole)) {
    editBtn.hidden = false;
  }

  loginModal.hidden = true;
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  username.hidden = true;
  logoutBtn.hidden = true;
  loginBtn.hidden = false;
  editBtn.hidden = true;
});

// Activar modo edición
editBtn.addEventListener("click", () => {
  if (!["admin", "tecnico"].includes(userRole)) {
    alert("❌ No tienes permisos de edición");
    return;
  }
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
