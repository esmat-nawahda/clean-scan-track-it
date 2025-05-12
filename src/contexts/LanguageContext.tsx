
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define supported languages
export type Language = 'en' | 'es' | 'fr' | 'ar';

// Define translations interface
export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Create translations
export const translations: Translations = {
  en: {
    // Page title
    "title": "SpotlessQR",
    "subtitle": "Please complete all items on the checklist",
    
    // Form elements
    "yourName": "Your Name",
    "cleaningChecklist": "Cleaning Checklist",
    "additionalNotes": "Additional Notes",
    "notesPlaceholder": "Enter any additional notes or issues (optional)",
    "submit": "Submit Cleaning Record",
    "submitting": "Submitting...",
    
    // Admin contact
    "needAssistance": "Need assistance? Contact admin",
    "facilityManager": "Facility Manager",
    
    // Checklist items
    "floors": "Floors cleaned and mopped",
    "surfaces": "All surfaces wiped and sanitized",
    "trash": "Trash emptied and replaced",
    "supplies": "Supplies restocked",
    "fixtures": "Fixtures cleaned and polished",
    
    // Toasts
    "selectName": "Please select your name",
    "completeChecklist": "Please complete all checklist items",
    "submitSuccess": "Cleaning record submitted successfully!",
    "submitError": "Failed to submit cleaning record",
    
    // Language
    "language": "Language",
    "english": "English",
    "spanish": "Spanish",
    "french": "French",
    "arabic": "Arabic",
  },
  es: {
    // Page title
    "title": "SpotlessQR",
    "subtitle": "Por favor complete todos los elementos de la lista",
    
    // Form elements
    "yourName": "Su Nombre",
    "cleaningChecklist": "Lista de Limpieza",
    "additionalNotes": "Notas Adicionales",
    "notesPlaceholder": "Ingrese cualquier nota o problema adicional (opcional)",
    "submit": "Enviar Registro de Limpieza",
    "submitting": "Enviando...",
    
    // Admin contact
    "needAssistance": "¿Necesita ayuda? Contacte al administrador",
    "facilityManager": "Gerente de Instalaciones",
    
    // Checklist items
    "floors": "Pisos limpiados y trapeados",
    "surfaces": "Todas las superficies limpiadas y desinfectadas",
    "trash": "Basura vaciada y reemplazada",
    "supplies": "Suministros reabastecidos",
    "fixtures": "Accesorios limpiados y pulidos",
    
    // Toasts
    "selectName": "Por favor seleccione su nombre",
    "completeChecklist": "Por favor complete todos los elementos de la lista",
    "submitSuccess": "¡Registro de limpieza enviado con éxito!",
    "submitError": "Error al enviar el registro de limpieza",
    
    // Language
    "language": "Idioma",
    "english": "Inglés",
    "spanish": "Español",
    "french": "Francés",
    "arabic": "Árabe",
  },
  fr: {
    // Page title
    "title": "SpotlessQR",
    "subtitle": "Veuillez compléter tous les éléments de la liste",
    
    // Form elements
    "yourName": "Votre Nom",
    "cleaningChecklist": "Liste de Nettoyage",
    "additionalNotes": "Notes Supplémentaires",
    "notesPlaceholder": "Entrez des notes ou problèmes supplémentaires (facultatif)",
    "submit": "Soumettre le Rapport de Nettoyage",
    "submitting": "Soumission en cours...",
    
    // Admin contact
    "needAssistance": "Besoin d'aide? Contactez l'administrateur",
    "facilityManager": "Gestionnaire des Installations",
    
    // Checklist items
    "floors": "Sols nettoyés et lavés",
    "surfaces": "Toutes les surfaces essuyées et désinfectées",
    "trash": "Poubelles vidées et remplacées",
    "supplies": "Fournitures réapprovisionnées",
    "fixtures": "Accessoires nettoyés et polis",
    
    // Toasts
    "selectName": "Veuillez sélectionner votre nom",
    "completeChecklist": "Veuillez compléter tous les éléments de la liste",
    "submitSuccess": "Rapport de nettoyage soumis avec succès!",
    "submitError": "Échec de la soumission du rapport de nettoyage",
    
    // Language
    "language": "Langue",
    "english": "Anglais",
    "spanish": "Espagnol",
    "french": "Français",
    "arabic": "Arabe",
  },
  ar: {
    // Page title
    "title": "SpotlessQR",
    "subtitle": "يرجى إكمال جميع العناصر في قائمة التحقق",
    
    // Form elements
    "yourName": "اسمك",
    "cleaningChecklist": "قائمة التنظيف",
    "additionalNotes": "ملاحظات إضافية",
    "notesPlaceholder": "أدخل أي ملاحظات أو مشاكل إضافية (اختياري)",
    "submit": "إرسال سجل التنظيف",
    "submitting": "جاري الإرسال...",
    
    // Admin contact
    "needAssistance": "هل تحتاج إلى مساعدة؟ اتصل بالمسؤول",
    "facilityManager": "مدير المنشأة",
    
    // Checklist items
    "floors": "تم تنظيف ومسح الأرضيات",
    "surfaces": "تم مسح وتطهير جميع الأسطح",
    "trash": "تم إفراغ واستبدال القمامة",
    "supplies": "تم إعادة تخزين المستلزمات",
    "fixtures": "تم تنظيف وتلميع التركيبات",
    
    // Toasts
    "selectName": "الرجاء اختيار اسمك",
    "completeChecklist": "يرجى إكمال جميع عناصر قائمة التحقق",
    "submitSuccess": "تم إرسال سجل التنظيف بنجاح!",
    "submitError": "فشل في إرسال سجل التنظيف",
    
    // Language
    "language": "اللغة",
    "english": "الإنجليزية",
    "spanish": "الإسبانية",
    "french": "الفرنسية",
    "arabic": "العربية",
  }
};

// Create context type
interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  changeLanguage: (lang: Language) => void;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Initialize language from localStorage if available
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && ['en', 'es', 'fr', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Change language function
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
