function toggleLanguageMenu() {
    var menu = document.getElementById("languagecontainer");
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

let currentLang = 'en'; // Default language

async function loadTranslations(lang) {
  const response = await fetch('translations.json');
  const translations = await response.json();
  return translations;
}

async function setLanguage(lang) {
  currentLang = lang;
  const translations = await loadTranslations(lang);
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.innerHTML  = translations[key][lang];
  });
  
  // Save preference
  localStorage.setItem('language', lang);
}

// Initialize with saved language or default
const savedLang = localStorage.getItem('language');
setLanguage(savedLang || 'en');