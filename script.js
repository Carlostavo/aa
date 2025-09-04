import { supabase } from "./supabaseClient.js";

const editBtn = document.getElementById("editModeBtn");
const editorPanel = document.getElementById("editorPanel");
const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");
const editContent = document.getElementById("editContent");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const username = document.getElementById("username");
const loginModal = document.getElementById("loginModal");
const doLogin = document.getElementById("doLogin");
const closeLogin = document.getElementById("closeLogin");
const loginError = document.getElementById("loginError");

let currentSection = null;
let userRole = "usuario";

// Mostrar modal login
loginBtn.addEventListener("click", () => {
  loginModal.style.display = "flex";
});

closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
  loginError.style.display = "none";
});

cancelEdit.addEventListener("click", () => {
  editorPanel.style.display = "none";
});

// Login con Supabase
doLogin.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    loginError.textContent = "Por favor, complete todos los campos";
    loginError.style.display = "block";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });

  if (error) {
    loginError.textContent = "Error: " + error.message;
    loginError.style.display = "block";
    return;
  }

  // Obtener información del usuario desde la tabla usuarios
  const { data: userData, error: userError } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (userError) {
    console.error("Error al obtener datos del usuario:", userError);
    userRole = "usuario";
  } else {
    userRole = userData?.role || "usuario";
  }

  username.textContent = data.user.email;
  username.style.display = "inline";
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";

  // Mostrar botón editar solo si es admin/tecnico
  if (["admin", "tecnico"].includes(userRole)) {
    editBtn.style.display = "inline-block";
  }

  loginModal.style.display = "none";
  loginError.style.display = "none";
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  username.style.display = "none";
  logoutBtn.style.display = "none";
  loginBtn.style.display = "inline-block";
  editBtn.style.display = "none";
  editorPanel.style.display = "none";
});

// Activar modo edición
editBtn.addEventListener("click", () => {
  if (!["admin", "tecnico"].includes(userRole)) {
    alert("❌ No tienes permisos de edición");
    return;
  }
  
  // Agregar event listeners a los elementos editables
  document.querySelectorAll("[data-section]").forEach((el) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", (e) => {
      if (e.target.tagName === "P" || e.target.tagName === "H2") {
        currentSection = el.getAttribute("data-section");
        editContent.value = e.target.textContent;
        editorPanel.style.display = "block";
      }
    });
  });
  alert("Modo edición activado. Haz clic en cualquier texto para editarlo.");
});

// Guardar cambios en Supabase
saveEdit.addEventListener("click", async () => {
  if (!currentSection) return;
  
  const { error } = await supabase
    .from("paginas")
    .update({ contenido: editContent.value })
    .eq("seccion", currentSection);

  if (error) {
    console.error("Error al guardar:", error);
    alert("❌ Error al guardar: " + error.message);
  } else {
    document.querySelector(`[data-section="${currentSection}"] p, 
                           [data-section="${currentSection}"] h2`).textContent = editContent.value;
    editorPanel.style.display = "none";
    alert("✅ Guardado correctamente");
  }
});

// Cargar contenido inicial
async function loadContent() {
  const { data, error } = await supabase.from("paginas").select("*");
  
  if (error) {
    console.error("Error al cargar contenido:", error);
    return;
  }
  
  data.forEach((row) => {
    const element = document.querySelector(`[data-section="${row.seccion}"] p, 
                                           [data-section="${row.seccion}"] h2`);
    if (element) element.textContent = row.contenido;
  });
}

// Verificar sesión al cargar la página
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    const { data: userData } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", session.user.id)
      .single();
    
    userRole = userData?.role || "usuario";
    
    username.textContent = session.user.email;
    username.style.display = "inline";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    
    if (["admin", "tecnico"].includes(userRole)) {
      editBtn.style.display = "inline-block";
    }
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  loadContent();
  
  // Escuchar cambios en tiempo real
  supabase
    .channel("paginas-changes")
    .on("postgres_changes", 
        { event: "*", schema: "public", table: "paginas" }, 
        (payload) => {
          const element = document.querySelector(`[data-section="${payload.new.seccion}"] p, 
                                                 [data-section="${payload.new.seccion}"] h2`);
          if (element) element.textContent = payload.new.contenido;
        })
    .subscribe();
});
