import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav.home": "Home",
      "nav.dashboard": "Dashboard",
      "nav.scan": "New Scan",
      "nav.profile": "My Profile",
      "nav.settings": "Settings",
      "nav.logout": "Log Out",
      "dashboard.recent": "Recent Insights",
      "dashboard.examples": "Try These Examples",
      "dashboard.profile": "Your Profile",
      "dashboard.updatePrefs": "Update Preferences",
      "dashboard.analyzeBtn": "Analyze This Food",
      "dashboard.didYouKnow": "Did you know?",
      "analyzer.title": "Scan Food Label",
      "analyzer.upload": "Upload Image",
      "analyzer.type": "Type Ingredients",
      "analyzer.barcode": "Scan Barcode",
      "results.title": "Insight Report",
      "results.breakdown": "Category Breakdown",
      "results.nutrition": "Nutrition Snapshot",
      "results.flags": "Specific Flags",
      "results.askAi": "Ask NutriShield AI"
    }
  },
  es: {
    translation: {
      "nav.home": "Inicio",
      "nav.dashboard": "Panel",
      "nav.scan": "Nuevo Escaneo",
      "nav.profile": "Mi Perfil",
      "nav.settings": "Ajustes",
      "nav.logout": "Cerrar Sesión",
      "dashboard.recent": "Análisis Recientes",
      "dashboard.examples": "Prueba Estos Ejemplos",
      "dashboard.profile": "Tu Perfil",
      "dashboard.updatePrefs": "Actualizar Preferencias",
      "dashboard.analyzeBtn": "Analizar Este Alimento",
      "dashboard.didYouKnow": "¿Sabías que?",
      "analyzer.title": "Escanear Etiqueta",
      "analyzer.upload": "Subir Imagen",
      "analyzer.type": "Escribir Ingredientes",
      "analyzer.barcode": "Escanear Código de Barras",
      "results.title": "Informe de Análisis",
      "results.breakdown": "Desglose por Categoría",
      "results.nutrition": "Resumen Nutricional",
      "results.flags": "Alertas Específicas",
      "results.askAi": "Preguntar a NutriShield AI"
    }
  },
  fr: {
    translation: {
      "nav.home": "Accueil",
      "nav.dashboard": "Tableau de Bord",
      "nav.scan": "Nouvelle Analyse",
      "nav.profile": "Mon Profil",
      "nav.settings": "Paramètres",
      "nav.logout": "Déconnexion",
      "dashboard.recent": "Analyses Récentes",
      "dashboard.examples": "Essayez Ces Exemples",
      "dashboard.profile": "Votre Profil",
      "dashboard.updatePrefs": "Mettre à Jour les Préférences",
      "dashboard.analyzeBtn": "Analyser cet Aliment",
      "dashboard.didYouKnow": "Le saviez-vous ?",
      "analyzer.title": "Scanner l'Étiquette",
      "analyzer.upload": "Télécharger une Image",
      "analyzer.type": "Taper les Ingrédients",
      "analyzer.barcode": "Scanner le Code-Barres",
      "results.title": "Rapport d'Analyse",
      "results.breakdown": "Répartition par Catégorie",
      "results.nutrition": "Aperçu Nutritionnel",
      "results.flags": "Alertes Spécifiques",
      "results.askAi": "Demander à l'IA NutriShield"
    }
  },
  hi: {
    translation: {
      "nav.home": "मुख्य पृष्ठ",
      "nav.dashboard": "डैशबोर्ड",
      "nav.scan": "नया स्कैन",
      "nav.profile": "मेरी प्रोफ़ाइल",
      "nav.settings": "सेटिंग्स",
      "nav.logout": "लॉग आउट",
      "dashboard.recent": "हाल के विश्लेषण",
      "dashboard.examples": "इन उदाहरणों को आज़माएं",
      "dashboard.profile": "आपकी प्रोफ़ाइल",
      "dashboard.updatePrefs": "प्राथमिकताएं अपडेट करें",
      "dashboard.analyzeBtn": "इस भोजन का विश्लेषण करें",
      "dashboard.didYouKnow": "क्या आप जानते हैं?",
      "analyzer.title": "फ़ूड लेबल स्कैन करें",
      "analyzer.upload": "छवि अपलोड करें",
      "analyzer.type": "सामग्री टाइप करें",
      "analyzer.barcode": "बारकोड स्कैन करें",
      "results.title": "विश्लेषण रिपोर्ट",
      "results.breakdown": "श्रेणी विवरण",
      "results.nutrition": "पोषण सारांश",
      "results.flags": "विशिष्ट चेतावनियाँ",
      "results.askAi": "NutriShield AI से पूछें"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('nutrishield_lang') || 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
