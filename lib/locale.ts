export type SupportedLocale = "en" | "fr" | "es" | "de" | "pt" | "ja" | "ko" | "zh-Hans" | "ar" | "hi";
export type LocaleDirection = "ltr" | "rtl";

export type LocaleInfo = { code: SupportedLocale; label: string; nativeLabel: string; direction: LocaleDirection; fallback: SupportedLocale };

export const LOCALES: LocaleInfo[] = [
  { code: "en", label: "English", nativeLabel: "English", direction: "ltr", fallback: "en" },
  { code: "fr", label: "French", nativeLabel: "Français", direction: "ltr", fallback: "en" },
  { code: "es", label: "Spanish", nativeLabel: "Español", direction: "ltr", fallback: "en" },
  { code: "de", label: "German", nativeLabel: "Deutsch", direction: "ltr", fallback: "en" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", direction: "ltr", fallback: "en" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", direction: "ltr", fallback: "en" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", direction: "ltr", fallback: "en" },
  { code: "zh-Hans", label: "Chinese", nativeLabel: "简体中文", direction: "ltr", fallback: "en" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", direction: "rtl", fallback: "en" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", direction: "ltr", fallback: "en" },
];

export function resolveLocale(value?: string): LocaleInfo {
  const normalized = (value ?? "en").replace("_", "-").toLowerCase();
  return LOCALES.find((locale) => locale.code.toLowerCase() === normalized)
    ?? LOCALES.find((locale) => locale.code.split("-")[0].toLowerCase() === normalized.split("-")[0])
    ?? LOCALES[0];
}

export function localeChain(value: SupportedLocale | string | undefined): SupportedLocale[] {
  const locale = resolveLocale(value);
  return [...new Set([locale.code, locale.fallback, "en" as SupportedLocale])];
}

export function interpolate(text: string, variables: Record<string, string | number> = {}): string {
  return text.replace(/\{\{(.*?)\}\}/g, (_, key: string) => String(variables[key.trim()] ?? ""));
}

export class TranslationStore {
  private readonly values = new Map<string, string>();
  set(locale: SupportedLocale, key: string, value: string): void { this.values.set(`${locale}:${key}`, value); }
  get(locale: SupportedLocale, key: string): string | undefined { return this.values.get(`${locale}:${key}`); }
}

export function translate(store: TranslationStore, locale: SupportedLocale, key: string, variables: Record<string, string | number> = {}): string {
  const value = localeChain(locale).map((candidate) => store.get(candidate, key)).find(Boolean) ?? key;
  return interpolate(value, variables);
}

export function createAppTranslations(): TranslationStore {
  const store = new TranslationStore();
  const entries: Record<string, Partial<Record<SupportedLocale, string>>> = {
    "media.title": { en: "Physics media", fr: "Médias de physique", es: "Medios de física" },
    "media.subtitle": { en: "Capture or choose a local image for an observation. Nothing is uploaded automatically.", fr: "Capturez ou choisissez une image locale pour une observation. Rien n’est envoyé automatiquement.", es: "Captura o elige una imagen local para una observación. Nada se sube automáticamente." },
    "media.localObservation": { en: "Local observation image", fr: "Image d’observation locale", es: "Imagen de observación local" },
    "media.choose": { en: "Choose from library", fr: "Choisir dans la bibliothèque", es: "Elegir de la biblioteca" },
    "media.take": { en: "Take a photo", fr: "Prendre une photo", es: "Tomar una foto" },
    "media.webUnavailable": { en: "Camera unavailable on web", fr: "Caméra indisponible sur le web", es: "Cámara no disponible en la web" },
    "media.localOnly": { en: "Preview only. The image remains local until you explicitly choose another action.", fr: "Aperçu uniquement. L’image reste locale jusqu’à une autre action explicite.", es: "Solo vista previa. La imagen permanece local hasta que elijas otra acción." },
    "lab.advancedLabel": { en: "ADVANCED PHYSICS · LOCAL MODEL", fr: "PHYSIQUE AVANCÉE · MODÈLE LOCAL", es: "FÍSICA AVANZADA · MODELO LOCAL" },
    "lab.advancedDescription": { en: "Explore time dilation, a force balance, and a quantum ground-state energy scale. These models are deterministic and keep equations separate from explanations.", fr: "Explorez la dilatation du temps, un équilibre des forces et une échelle d’énergie de l’état fondamental quantique. Ces modèles sont déterministes et séparent les équations des explications.", es: "Explora la dilatación temporal, un equilibrio de fuerzas y una escala de energía del estado fundamental cuántico. Estos modelos son deterministas y separan ecuaciones de explicaciones." },
    "lab.forceBalance": { en: "force balance: ΣF = 0", fr: "équilibre des forces : ΣF = 0", es: "equilibrio de fuerzas: ΣF = 0" },
    "lens.media.choose": { en: "Choose local observation image", fr: "Choisir une image d’observation locale", es: "Elegir imagen de observación local" },
    "lens.media.capture": { en: "Capture local observation image", fr: "Capturer une image d’observation locale", es: "Capturar imagen de observación local" },
    "lens.media.unavailable": { en: "Camera unavailable on web", fr: "Caméra indisponible sur le web", es: "Cámara no disponible en la web" },
    "lens.media.remove": { en: "Remove attached image", fr: "Supprimer l’image jointe", es: "Eliminar imagen adjunta" },
    "lens.media.permission": { en: "Permission was not granted. You can enable it in device settings.", fr: "L’autorisation n’a pas été accordée. Vous pouvez l’activer dans les réglages.", es: "No se concedió el permiso. Puedes activarlo en los ajustes del dispositivo." },
    "lens.media.canceled": { en: "No media was selected.", fr: "Aucun média n’a été sélectionné.", es: "No se seleccionó ningún medio." },
    "lens.media.ready": { en: "Media is ready on this device.", fr: "Le média est prêt sur cet appareil.", es: "El medio está listo en este dispositivo." },
    "lens.media.unavailableMessage": { en: "This media feature is unavailable on this device or browser.", fr: "Cette fonction multimédia est indisponible sur cet appareil ou ce navigateur.", es: "Esta función multimedia no está disponible en este dispositivo o navegador." },
    "lens.media.offline": { en: "The capture is local-only, but this action requires an available device service.", fr: "La capture reste locale, mais cette action nécessite un service d’appareil disponible.", es: "La captura es local, pero esta acción requiere un servicio disponible del dispositivo." },
    "lens.media.error": { en: "We could not access media. Your existing study data is unchanged.", fr: "Impossible d’accéder au média. Vos données d’étude restent inchangées.", es: "No pudimos acceder al medio. Tus datos de estudio no han cambiado." },
    "tutor.usageRecovered": { en: "Daily usage data was unavailable, so a safe local limit is in use.", fr: "Les données d’utilisation quotidiennes étaient indisponibles ; une limite locale sûre est utilisée.", es: "Los datos de uso diario no estaban disponibles; se usa un límite local seguro." },
    "tutor.usageUnavailable": { en: "Daily usage data is temporarily unavailable; you can still continue with the local limit.", fr: "Les données d’utilisation quotidiennes sont temporairement indisponibles ; vous pouvez continuer avec la limite locale.", es: "Los datos de uso diario no están disponibles temporalmente; puedes continuar con el límite local." },
    "tutor.localFallback": { en: "The tutor service was unavailable, so this structured answer came from PhysicaAI’s local mock fallback. No AI usage was consumed.", fr: "Le service de tutorat était indisponible ; cette réponse structurée provient du mode local de PhysicaAI. Aucune utilisation d’IA n’a été consommée.", es: "El servicio de tutoría no estaba disponible; esta respuesta estructurada proviene del respaldo local de PhysicaAI. No se consumió uso de IA." },
    "notebook.verifiedConcept": { en: "Choose a verified concept before saving your reflection.", fr: "Choisissez un concept vérifié avant d’enregistrer votre réflexion.", es: "Elige un concepto verificado antes de guardar tu reflexión." },
    "notebook.saved": { en: "Reflection saved to your local Notebook.", fr: "Réflexion enregistrée dans votre Notebook local.", es: "Reflexión guardada en tu Notebook local." },
    "lens.media.caption": { en: "Caption", fr: "Légende", es: "Descripción" },
    "lens.media.capturedAt": { en: "Captured locally", fr: "Capturé localement", es: "Capturado localmente" },
    "notebook.media": { en: "Local observation image", fr: "Image d’observation locale", es: "Imagen de observación local" },
    "notebook.caption": { en: "Caption", fr: "Légende", es: "Descripción" },
    "notebook.capturedAt": { en: "Captured locally", fr: "Capturé localement", es: "Capturado localmente" },
    "notebook.closePreview": { en: "Close preview", fr: "Fermer l’aperçu", es: "Cerrar vista previa" },
    "notebook.previewUnavailable": { en: "This local preview is unavailable, but the Notebook entry remains intact.", fr: "Cet aperçu local est indisponible, mais l’entrée du Notebook reste intacte.", es: "Esta vista previa local no está disponible, pero la entrada del Notebook permanece intacta." },
    "notebook.retryPreview": { en: "Retry preview", fr: "Réessayer l’aperçu", es: "Reintentar vista previa" },
    "notebook.thumbnailUnavailable": { en: "Thumbnail unavailable", fr: "Miniature indisponible", es: "Miniatura no disponible" },
    "common.clear": { en: "Clear", fr: "Effacer", es: "Borrar" },
    "common.none": { en: "none", fr: "aucun", es: "ninguno" },
    "concepts.title": { en: "Concept library", fr: "Bibliothèque de concepts", es: "Biblioteca de conceptos" },
    "concepts.subtitle": { en: "Search grounded explanations before reaching for a formula.", fr: "Recherchez des explications fondées avant de choisir une formule.", es: "Busca explicaciones fundamentadas antes de elegir una fórmula." },
    "concepts.searchLabel": { en: "Search physics concepts", fr: "Rechercher des concepts de physique", es: "Buscar conceptos de física" },
    "concepts.searchPlaceholder": { en: "Search kinematics, energy…", fr: "Rechercher cinématique, énergie…", es: "Buscar cinemática, energía…" },
    "concepts.clearSearch": { en: "Clear concept search", fr: "Effacer la recherche de concepts", es: "Borrar búsqueda de conceptos" },
    "concepts.noneTitle": { en: "No matching concepts", fr: "Aucun concept correspondant", es: "No hay conceptos coincidentes" },
    "concepts.noneBody": { en: "Try a broader term such as motion, force, energy, or waves.", fr: "Essayez un terme plus général comme mouvement, force, énergie ou ondes.", es: "Prueba un término más amplio como movimiento, fuerza, energía u ondas." },
    "concepts.whyMatters": { en: "Why it matters", fr: "Pourquoi c’est important", es: "Por qué importa" },
    "concepts.prerequisites": { en: "Prerequisites: {{values}}", fr: "Prérequis : {{values}}", es: "Requisitos previos: {{values}}" },
    "concepts.practice": { en: "Practice this concept", fr: "Pratiquer ce concept", es: "Practicar este concepto" },
    "common.saving": { en: "Saving…", fr: "Enregistrement…", es: "Guardando…" },
    "practice.title": { en: "Practice", fr: "Pratique", es: "Práctica" },
    "practice.subtitle": { en: "Short attempts create durable intuition.", fr: "De courts essais créent une intuition durable.", es: "Los intentos breves crean una intuición duradera." },
    "practice.answerGuidance": { en: "Answer in {{unit}}. A small rounding difference is okay.", fr: "Répondez en {{unit}}. Une petite différence d’arrondi est acceptable.", es: "Responde en {{unit}}. Se acepta una pequeña diferencia de redondeo." },
    "practice.answerPlaceholder": { en: "Your answer", fr: "Votre réponse", es: "Tu respuesta" },
    "practice.checkAnswer": { en: "Check answer", fr: "Vérifier la réponse", es: "Comprobar respuesta" },
    "practice.hintShown": { en: "Hint shown", fr: "Indice affiché", es: "Pista mostrada" },
    "practice.getHint": { en: "Get hint", fr: "Obtenir un indice", es: "Obtener pista" },
    "practice.hintBody": { en: "Hint: identify the equation first, then substitute values while keeping the units visible.", fr: "Indice : identifiez d’abord l’équation, puis remplacez les valeurs en gardant les unités visibles.", es: "Pista: identifica primero la ecuación y luego sustituye los valores manteniendo visibles las unidades." },
    "practice.correct": { en: "Correct — verified by the engine.", fr: "Correct — vérifié par le moteur.", es: "Correcto — verificado por el motor." },
    "practice.incorrect": { en: "Not quite. Review the equation and try again.", fr: "Pas tout à fait. Revoyez l’équation et réessayez.", es: "No exactamente. Revisa la ecuación e inténtalo de nuevo." },
    "practice.expected": { en: "Expected value: {{value}} {{unit}}", fr: "Valeur attendue : {{value}} {{unit}}", es: "Valor esperado: {{value}} {{unit}}" },
    "practice.nextQuestion": { en: "Next question", fr: "Question suivante", es: "Siguiente pregunta" },
    "practice.saveNotebook": { en: "Save explanation to Notebook", fr: "Enregistrer l’explication dans le Notebook", es: "Guardar explicación en el Notebook" },
    "practice.savedNotebook": { en: "Saved locally to your Notebook.", fr: "Enregistré localement dans votre Notebook.", es: "Guardado localmente en tu Notebook." },
    "common.tryAgain": { en: "Try again", fr: "Réessayer", es: "Intentar de nuevo" },
    "common.send": { en: "Send", fr: "Envoyer", es: "Enviar" },
    "tutor.title": { en: "Tutor", fr: "Tuteur", es: "Tutor" },
    "tutor.subtitle": { en: "Reason first. Verify the numbers.", fr: "Raisonnez d’abord. Vérifiez les nombres.", es: "Razona primero. Verifica los números." },
    "tutor.remaining": { en: "Free tutor uses remaining today", fr: "Utilisations gratuites restantes aujourd’hui", es: "Usos gratuitos restantes hoy" },
    "tutor.plusPrompt": { en: "See optional Plus plans for more AI usage", fr: "Voir les offres Plus facultatives pour plus d’utilisation de l’IA", es: "Ver planes Plus opcionales para más uso de IA" },
    "tutor.checking": { en: "Checking your question…", fr: "Vérification de votre question…", es: "Comprobando tu pregunta…" },
    "tutor.checkingShort": { en: "Checking…", fr: "Vérification…", es: "Comprobando…" },
    "tutor.focusedPrompt": { en: "Try a focused prompt", fr: "Essayez une question ciblée", es: "Prueba una pregunta concreta" },
    "tutor.conceptChip": { en: "Concept", fr: "Concept", es: "Concepto" },
    "tutor.verifiedChip": { en: "Verified example", fr: "Exemple vérifié", es: "Ejemplo verificado" },
    "tutor.hintChip": { en: "Hint", fr: "Indice", es: "Pista" },
    "tutor.hintLadder": { en: "Hint ladder", fr: "Échelle d’indices", es: "Escalera de pistas" },
    "tutor.questionPlaceholder": { en: "Ask a physics question…", fr: "Posez une question de physique…", es: "Haz una pregunta de física…" },
    "tutor.limitReached": { en: "Daily free usage reached", fr: "Limite quotidienne gratuite atteinte", es: "Límite diario gratuito alcanzado" },
    "achievement.loading": { en: "Loading achievement details…", fr: "Chargement des détails du succès…", es: "Cargando detalles del logro…" },
    "achievement.retryProgress": { en: "Retry loading progress", fr: "Réessayer de charger la progression", es: "Reintentar la carga del progreso" },
    "achievement.title": { en: "Achievement detail", fr: "Détails du succès", es: "Detalles del logro" },
    "achievement.subtitle": { en: "Progress is evidence of understanding, not a race.", fr: "La progression témoigne de la compréhension, pas d’une course.", es: "El progreso demuestra comprensión, no es una carrera." },
    "achievement.earned": { en: "Earned from your learning activity", fr: "Obtenu grâce à votre activité d’apprentissage", es: "Obtenido gracias a tu actividad de aprendizaje" },
    "achievement.notEarned": { en: "Not earned yet", fr: "Pas encore obtenu", es: "Aún no obtenido" },
    "achievement.keepGoing": { en: "Keep building understanding at your own pace.", fr: "Continuez à développer votre compréhension à votre rythme.", es: "Sigue construyendo comprensión a tu ritmo." },
    "achievement.evidence": { en: "Complete the evidence described above. Practice, lessons, and labs are counted only when you finish the learning action.", fr: "Complétez les éléments décrits ci-dessus. La pratique, les leçons et les laboratoires ne sont comptés qu’après l’action d’apprentissage.", es: "Completa la evidencia descrita arriba. La práctica, las lecciones y los laboratorios solo cuentan al terminar la acción de aprendizaje." },
    "achievement.back": { en: "Back to progress", fr: "Retour à la progression", es: "Volver al progreso" },
    "common.done": { en: "Done", fr: "Terminé", es: "Listo" },
    "settings.title": { en: "Settings", fr: "Réglages", es: "Ajustes" },
    "settings.subtitle": { en: "Choose how PhysicaAI supports your learning.", fr: "Choisissez comment PhysicaAI accompagne votre apprentissage.", es: "Elige cómo PhysicaAI apoya tu aprendizaje." },
    "settings.streakTitle": { en: "Show learning streak", fr: "Afficher la série d’apprentissage", es: "Mostrar racha de aprendizaje" },
    "settings.streakBody": { en: "Optional motivation only. Turning this off never affects progress or achievements.", fr: "Motivation facultative. La désactiver n’affecte jamais la progression ni les succès.", es: "Solo es motivación opcional. Desactivarla nunca afecta al progreso ni a los logros." },
    "settings.motionTitle": { en: "Reduce motion", fr: "Réduire les mouvements", es: "Reducir movimiento" },
    "settings.motionBody": { en: "Use calmer state changes and less animated feedback.", fr: "Utilisez des changements d’état plus calmes et moins d’animations.", es: "Usa cambios de estado más suaves y menos animaciones." },
    "settings.hapticsTitle": { en: "Haptic feedback", fr: "Retour haptique", es: "Respuesta háptica" },
    "settings.hapticsBody": { en: "Allow gentle vibration for meaningful actions such as completing a lab.", fr: "Autoriser une vibration légère pour les actions importantes, comme terminer un laboratoire.", es: "Permite una vibración suave para acciones importantes, como completar un laboratorio." },
    "settings.languageTitle": { en: "Language", fr: "Langue", es: "Idioma" },
    "settings.languageBody": { en: "Choose labels and number formatting for supported physics content. Equations and SI units stay unchanged.", fr: "Choisissez les libellés et le format des nombres. Les équations et unités SI restent inchangées.", es: "Elige etiquetas y formato numérico. Las ecuaciones y unidades del SI no cambian." },
    "settings.offlineTitle": { en: "Connection and offline saves", fr: "Connexion et sauvegardes hors ligne", es: "Conexión y guardados sin conexión" },
    "settings.learningPathTitle": { en: "Learning path", fr: "Parcours d’apprentissage", es: "Ruta de aprendizaje" },
    "progress.title": { en: "Progress", fr: "Progression", es: "Progreso" },
    "progress.subtitle": { en: "Mastery comes first. Motivation stays gentle and optional.", fr: "La maîtrise d’abord. La motivation reste douce et facultative.", es: "Primero el dominio. La motivación es suave y opcional." },
    "progress.retry": { en: "Retry loading progress", fr: "Réessayer de charger la progression", es: "Reintentar la carga del progreso" },
    "progress.accuracy": { en: "Practice accuracy", fr: "Précision des exercices", es: "Precisión de práctica" },
    "progress.emptyAccuracy": { en: "Complete a practice question to start your progress map.", fr: "Répondez à une question pour commencer votre carte de progression.", es: "Completa una pregunta de práctica para iniciar tu mapa de progreso." },
    "progress.xp": { en: "LEARNING XP", fr: "XP D’APPRENTISSAGE", es: "XP DE APRENDIZAJE" },
    "progress.level": { en: "Level {{level}}", fr: "Niveau {{level}}", es: "Nivel {{level}}" },
    "progress.streak": { en: "STREAK", fr: "SÉRIE", es: "RACHA" },
    "progress.hidden": { en: "Hidden", fr: "Masquée", es: "Oculta" },
    "progress.streakOff": { en: "Streak display is off in Settings.", fr: "L’affichage de la série est désactivé dans les réglages.", es: "La racha está desactivada en Ajustes." },
    "progress.todayMission": { en: "TODAY’S MISSION", fr: "MISSION DU JOUR", es: "MISIÓN DE HOY" },
    "progress.achievements": { en: "Achievements", fr: "Succès", es: "Logros" },
    "progress.achievementsSubtitle": { en: "Earned through meaningful learning evidence.", fr: "Obtenus grâce à des preuves d’apprentissage significatives.", es: "Se obtienen mediante evidencias de aprendizaje significativas." },
    "progress.all": { en: "All", fr: "Tous", es: "Todos" },
    "progress.earned": { en: "Earned", fr: "Obtenus", es: "Obtenidos" },
    "progress.inProgress": { en: "In progress", fr: "En cours", es: "En progreso" },
    "progress.topicGuidance": { en: "Topic guidance", fr: "Conseils par thème", es: "Orientación por tema" },
    "progress.topicGuidanceSubtitle": { en: "Suggested starting points until more topic evidence is recorded.", fr: "Points de départ suggérés en attendant davantage de preuves par thème.", es: "Puntos de partida sugeridos hasta registrar más evidencias por tema." },
    "progress.settingsPrivacy": { en: "Settings and privacy", fr: "Réglages et confidentialité", es: "Ajustes y privacidad" },
    "progress.settingsPrivacyBody": { en: "Control streak display and review local study data.", fr: "Contrôlez l’affichage de la série et consultez vos données d’étude locales.", es: "Controla la racha y revisa tus datos de estudio locales." },
    "home.retryDashboard": { en: "Retry loading dashboard", fr: "Réessayer de charger le tableau de bord", es: "Reintentar la carga del panel" },
    "home.greeting": { en: "Hi, physicist", fr: "Bonjour, physicien", es: "Hola, físico" },
    "home.greetingBody": { en: "Let’s understand some physics today.", fr: "Comprenons la physique aujourd’hui.", es: "Entendamos algo de física hoy." },
    "home.getStarted": { en: "GET STARTED", fr: "COMMENCER", es: "EMPEZAR" },
    "home.setupPath": { en: "Set up your learning path", fr: "Configurez votre parcours d’apprentissage", es: "Configura tu ruta de aprendizaje" },
    "home.setupBody": { en: "Choose your starting level and what you want to do first. It takes less than a minute and stays on this device.", fr: "Choisissez votre niveau de départ et votre première activité. Cela prend moins d’une minute et reste sur cet appareil.", es: "Elige tu nivel inicial y qué quieres hacer primero. Tarda menos de un minuto y permanece en este dispositivo." },
    "home.personalize": { en: "Personalize my start", fr: "Personnaliser mon départ", es: "Personalizar mi inicio" },
    "home.todayPlan": { en: "TODAY’S PLAN", fr: "PLAN DU JOUR", es: "PLAN DE HOY" },
    "home.changePath": { en: "Change learning path", fr: "Changer de parcours", es: "Cambiar ruta de aprendizaje" },
    "home.nextConcept": { en: "NEXT CONCEPT", fr: "PROCHAIN CONCEPT", es: "PRÓXIMO CONCEPTO" },
    "home.notStarted": { en: "Not started", fr: "Pas commencé", es: "Sin comenzar" },
    "home.correctLocally": { en: "correct locally", fr: "correct localement", es: "correctas localmente" },
    "home.localMastery": { en: "Local mastery: {{value}}", fr: "Maîtrise locale : {{value}}", es: "Dominio local: {{value}}" },
    "home.practiceConcept": { en: "Practice this concept", fr: "Pratiquer ce concept", es: "Practicar este concepto" },
    "home.openConcept": { en: "Open concept", fr: "Ouvrir le concept", es: "Abrir concepto" },
    "home.quickActions": { en: "Quick actions", fr: "Actions rapides", es: "Acciones rápidas" },
    "home.quickActionsBody": { en: "Choose a focused way to learn.", fr: "Choisissez une façon ciblée d’apprendre.", es: "Elige una forma enfocada de aprender." },
    "home.recentActivity": { en: "Recent activity", fr: "Activité récente", es: "Actividad reciente" },
    "home.viewAll": { en: "View all", fr: "Tout afficher", es: "Ver todo" },
    "home.noActivity": { en: "No activity yet", fr: "Aucune activité", es: "Aún no hay actividad" },
    "home.noActivityBody": { en: "Ask your first question or start a practice set to see your learning history here.", fr: "Posez votre première question ou commencez un exercice pour voir votre historique ici.", es: "Haz tu primera pregunta o inicia una práctica para ver aquí tu historial." },
    "home.startPractice": { en: "Start practice", fr: "Commencer un exercice", es: "Empezar práctica" },
    "home.askTutor": { en: "Ask Tutor", fr: "Demander au tuteur", es: "Preguntar al tutor" },
    "home.physicsLab": { en: "Physics Lab", fr: "Laboratoire de physique", es: "Laboratorio de física" },
    "home.scan": { en: "Scan", fr: "Scanner", es: "Escanear" },
    "home.lens": { en: "Lens", fr: "Lentille", es: "Lente" },
    "home.lesson": { en: "Lesson", fr: "Leçon", es: "Lección" },
    "home.concepts": { en: "Concepts", fr: "Concepts", es: "Conceptos" },
    "home.notebook": { en: "Living Notebook", fr: "Notebook vivant", es: "Cuaderno vivo" },
    "home.notebookBody": { en: "Revisit saved experiments and keep your reflections on-device.", fr: "Revoyez vos expériences enregistrées et gardez vos réflexions sur l’appareil.", es: "Revisa tus experimentos guardados y conserva tus reflexiones en el dispositivo." },
    "home.open": { en: "Open", fr: "Ouvrir", es: "Abrir" },
    "home.new": { en: "NEW", fr: "NOUVEAU", es: "NUEVO" },
    "home.physicsMap": { en: "Your physics map", fr: "Votre carte de physique", es: "Tu mapa de física" },
    "home.emptyMap": { en: "Complete your first practice attempt to start your progress map.", fr: "Terminez votre premier exercice pour commencer votre carte de progression.", es: "Completa tu primer ejercicio para iniciar tu mapa de progreso." },
    "home.recentAttempt": { en: "Your latest attempt is ready for a focused follow-up.", fr: "Votre dernier essai est prêt pour un suivi ciblé.", es: "Tu último intento está listo para un seguimiento enfocado." },
    "home.continue": { en: "Continue {{topic}}", fr: "Continuer {{topic}}", es: "Continuar {{topic}}" },
    "onboarding.title": { en: "Welcome to PhysicaAI", fr: "Bienvenue dans PhysicaAI", es: "Bienvenido a PhysicaAI" },
    "onboarding.step": { en: "Step {{step}} of 3", fr: "Étape {{step}} sur 3", es: "Paso {{step}} de 3" },
    "onboarding.localFirst": { en: "LOCAL-FIRST LEARNING", fr: "APPRENTISSAGE LOCAL", es: "APRENDIZAJE LOCAL" },
    "onboarding.learnByDoing": { en: "Learn physics by doing.", fr: "Apprenez la physique en pratiquant.", es: "Aprende física practicando." },
    "onboarding.introBody": { en: "Ask a Tutor question, test an idea in the Lab, practice with feedback, and watch your progress grow. You can change your choices later.", fr: "Posez une question au tuteur, testez une idée au laboratoire, pratiquez avec des retours et suivez vos progrès. Vous pourrez modifier vos choix plus tard.", es: "Haz una pregunta al tutor, prueba una idea en el laboratorio, practica con comentarios y observa tu progreso. Puedes cambiar tus opciones más tarde." },
    "onboarding.chooseStart": { en: "Choose my starting point", fr: "Choisir mon point de départ", es: "Elegir mi punto de partida" },
    "onboarding.startingQuestion": { en: "Where are you starting?", fr: "Quel est votre point de départ ?", es: "¿Cuál es tu punto de partida?" },
    "onboarding.chooseGoal": { en: "Choose a goal", fr: "Choisir un objectif", es: "Elegir un objetivo" },
    "onboarding.goalQuestion": { en: "What would help most today?", fr: "Qu’est-ce qui vous aiderait le plus aujourd’hui ?", es: "¿Qué te ayudaría más hoy?" },
    "onboarding.startLearning": { en: "Start learning", fr: "Commencer à apprendre", es: "Empezar a aprender" },
    "onboarding.skip": { en: "Skip setup", fr: "Ignorer la configuration", es: "Omitir configuración" },
    "onboarding.selected": { en: "Selected", fr: "Sélectionné", es: "Seleccionado" },
    "onboarding.levelNew": { en: "I’m new to physics", fr: "Je débute en physique", es: "Soy nuevo en física" },
    "onboarding.levelNewBody": { en: "Start with concepts and gentle examples.", fr: "Commencez par les concepts et des exemples progressifs.", es: "Empieza con conceptos y ejemplos sencillos." },
    "onboarding.levelSchool": { en: "I’m studying physics", fr: "J’étudie la physique", es: "Estoy estudiando física" },
    "onboarding.levelSchoolBody": { en: "Connect explanations to practice and equations.", fr: "Reliez les explications aux exercices et aux équations.", es: "Conecta las explicaciones con ejercicios y ecuaciones." },
    "onboarding.levelExam": { en: "I’m preparing for an exam", fr: "Je prépare un examen", es: "Me preparo para un examen" },
    "onboarding.levelExamBody": { en: "Focus on efficient practice and misconceptions.", fr: "Concentrez-vous sur une pratique efficace et les idées fausses.", es: "Enfócate en la práctica eficiente y los errores conceptuales." },
    "onboarding.goalUnderstand": { en: "Understand the ideas", fr: "Comprendre les idées", es: "Entender las ideas" },
    "onboarding.goalUnderstandBody": { en: "Build intuition before calculating.", fr: "Construisez votre intuition avant de calculer.", es: "Desarrolla intuición antes de calcular." },
    "onboarding.goalPractice": { en: "Practice problems", fr: "Pratiquer les problèmes", es: "Practicar problemas" },
    "onboarding.goalPracticeBody": { en: "Work through feedback-rich questions.", fr: "Résolvez des questions riches en retours.", es: "Resuelve preguntas con comentarios útiles." },
    "onboarding.goalExperiment": { en: "Run experiments", fr: "Réaliser des expériences", es: "Hacer experimentos" },
    "onboarding.goalExperimentBody": { en: "Explore motion with deterministic labs.", fr: "Explorez le mouvement avec des laboratoires déterministes.", es: "Explora el movimiento con laboratorios deterministas." },
    "lab.title": { en: "Physics Lab", fr: "Laboratoire de physique", es: "Laboratorio de física" },
    "lab.subtitle": { en: "Manipulate a model and inspect verified values.", fr: "Manipulez un modèle et examinez des valeurs vérifiées.", es: "Manipula un modelo y revisa valores verificados." },
    "lab.play": { en: "Play", fr: "Lire", es: "Reproducir" },
    "lab.pause": { en: "Pause", fr: "Pause", es: "Pausa" },
    "lab.reset": { en: "Reset", fr: "Réinitialiser", es: "Restablecer" },
    "lab.waveExperiment": { en: "WAVE EXPERIMENT · DETERMINISTIC", fr: "EXPÉRIENCE D’ONDE · DÉTERMINISTE", es: "EXPERIMENTO DE ONDAS · DETERMINISTA" },
    "lab.opticsExperiment": { en: "OPTICS EXPERIMENT · SNELL'S LAW", fr: "EXPÉRIENCE D’OPTIQUE · LOI DE SNELL", es: "EXPERIMENTO DE ÓPTICA · LEY DE SNELL" },
    "lab.thermalExperiment": { en: "THERMAL EXPERIMENT · Q = mcΔT", fr: "EXPÉRIENCE THERMIQUE · Q = mcΔT", es: "EXPERIMENTO TÉRMICO · Q = mcΔT" },
    "lab.mechanicsExperiment": { en: "MECHANICS EXPERIMENT · VERIFIED", fr: "EXPÉRIENCE DE MÉCANIQUE · VÉRIFIÉE", es: "EXPERIMENTO DE MECÁNICA · VERIFICADO" },
    "lab.speed": { en: "Speed", fr: "Vitesse", es: "Velocidad" },
    "lab.period": { en: "Period", fr: "Période", es: "Período" },
    "lab.totalInternalReflection": { en: "Total internal reflection", fr: "Réflexion totale interne", es: "Reflexión interna total" },
    "lab.refractedAngle": { en: "Refracted angle", fr: "Angle réfracté", es: "Ángulo refractado" },
    "lab.criticalAngle": { en: "The critical angle is {{value}}°.", fr: "L’angle critique est de {{value}}°.", es: "El ángulo crítico es {{value}}°." },
    "lab.newtonianRay": { en: "The ray enters the second medium and bends away from the normal.", fr: "Le rayon entre dans le second milieu et s’écarte de la normale.", es: "El rayo entra dans le second medio y se aleja de la normal." },
    "lab.launchSpeed": { en: "Launch speed (m/s)", fr: "Vitesse de lancement (m/s)", es: "Velocidad inicial (m/s)" },
    "lab.launchAngle": { en: "Launch angle (°)", fr: "Angle de lancement (°)", es: "Ángulo de lanzamiento (°)" },
    "lab.frequency": { en: "Frequency (Hz)", fr: "Fréquence (Hz)", es: "Frecuencia (Hz)" },
    "lab.wavelength": { en: "Wavelength (m)", fr: "Longueur d’onde (m)", es: "Longitud de onda (m)" },
    "lab.incidentAngle": { en: "Incident angle (°)", fr: "Angle d’incidence (°)", es: "Ángulo de incidencia (°)" },
    "lab.temperatureChange": { en: "Temperature change (K)", fr: "Variation de température (K)", es: "Cambio de temperatura (K)" },
    "lab.waveMotion": { en: "wave motion", fr: "mouvement ondulatoire", es: "movimiento ondulatorio" },
    "lab.optics": { en: "optics", fr: "optique", es: "óptica" },
    "lab.heatCapacity": { en: "heat capacity", fr: "capacité thermique", es: "capacidad calorífica" },
    "lab.waveDescription": { en: "Change frequency and wavelength to verify v = fλ without moving matter as a whole.", fr: "Modifiez la fréquence et la longueur d’onde pour vérifier v = fλ sans déplacer la matière dans son ensemble.", es: "Cambia la frecuencia y la longitud de onda para verificar v = fλ sin mover la materia en conjunto." },
    "lab.opticsDescription": { en: "Explore light moving from glass (n = 1.50) into air (n = 1.00). Angles are measured from the normal.", fr: "Explorez la lumière passant du verre (n = 1,50) à l’air (n = 1,00). Les angles sont mesurés depuis la normale.", es: "Explora la luz que pasa del vidrio (n = 1,50) al aire (n = 1,00). Los ángulos se miden desde la normal." },
    "lab.thermalDescription": { en: "Estimate the energy needed to warm 0.50 kg of water. The model uses a specific heat of 4186 J/(kg·K).", fr: "Estimez l’énergie nécessaire pour chauffer 0,50 kg d’eau. Le modèle utilise une capacité thermique de 4186 J/(kg·K).", es: "Estima la energía necesaria para calentar 0,50 kg de agua. El modelo usa un calor específico de 4186 J/(kg·K)." },
    "lab.mechanicsDescription": { en: "Use one 2 kg object to connect speed, energy, momentum, and impulse.", fr: "Utilisez un objet de 2 kg pour relier vitesse, énergie, quantité de mouvement et impulsion.", es: "Usa un objeto de 2 kg para conectar velocidad, energía, cantidad de movimiento e impulso." },
    "lab.circularHeading": { en: "CIRCULAR MOTION · VERIFIED", fr: "MOUVEMENT CIRCULAIRE · VÉRIFIÉ", es: "MOVIMIENTO CIRCULAR · VERIFICADO" },
    "lab.electrostaticsHeading": { en: "ELECTROSTATICS · VERIFIED", fr: "ÉLECTROSTATIQUE · VÉRIFIÉE", es: "ELECTROSTÁTICA · VERIFICADA" },
    "lab.circuitsHeading": { en: "CIRCUITS · OHM'S LAW", fr: "CIRCUITS · LOI D’OHM", es: "CIRCUITOS · LEY DE OHM" },
    "lab.fluidsHeading": { en: "FLUIDS · PRESSURE AND BUOYANCY", fr: "FLUIDES · PRESSION ET POUSSÉE", es: "FLUIDOS · PRESIÓN Y FLOTACIÓN" },
    "lab.harmonicHeading": { en: "HARMONIC MOTION · OSCILLATION", fr: "MOUVEMENT HARMONIQUE · OSCILLATION", es: "MOVIMIENTO ARMÓNICO · OSCILACIÓN" },
    "lab.collisionHeading": { en: "ELASTIC COLLISION · MOMENTUM", fr: "COLLISION ÉLASTIQUE · QUANTITÉ DE MOUVEMENT", es: "COLISIÓN ELÁSTICA · CANTIDAD DE MOVIMIENTO" },
    "lab.workHeading": { en: "WORK AND POWER · ENERGY TRANSFER", fr: "TRAVAIL ET PUISSANCE · TRANSFERT D’ÉNERGIE", es: "TRABAJO Y POTENCIA · TRANSFERENCIA DE ENERGÍA" },
    "lab.elasticityHeading": { en: "ELASTICITY · SPRING ENERGY", fr: "ÉLASTICITÉ · ÉNERGIE DU RESSORT", es: "ELASTICIDAD · ENERGÍA DEL RESORTE" },
    "lab.gravityHeading": { en: "GRAVITATIONAL ENERGY · mgh", fr: "ÉNERGIE GRAVITATIONNELLE · mgh", es: "ENERGÍA GRAVITACIONAL · mgh" },
    "lab.required": { en: "required", fr: "nécessaires", es: "necesarios" },
    "lab.kineticEnergy": { en: "kinetic energy", fr: "énergie cinétique", es: "energía cinética" },
    "lab.tangentialSpeed": { en: "tangential speed", fr: "vitesse tangentielle", es: "velocidad tangencial" },
    "lab.attractiveForce": { en: "attractive force", fr: "force attractive", es: "fuerza de atracción" },
    "lab.fieldStrength": { en: "field strength", fr: "intensité du champ", es: "intensidad del campo" },
    "lab.current": { en: "current", fr: "courant", es: "corriente" },
    "lab.power": { en: "power", fr: "puissance", es: "potencia" },
    "lab.learnAbout": { en: "Learn about {{label}}", fr: "En savoir plus sur {{label}}", es: "Más información sobre {{label}}" },
    "network.offline": { en: "Offline", fr: "Hors ligne", es: "Sin conexión" },
    "network.checking": { en: "Checking connection", fr: "Vérification de la connexion", es: "Comprobando la conexión" },
    "network.offlineMessage": { en: "Offline mode: your work stays on this device and will retry when connected.", fr: "Mode hors ligne : votre travail reste sur cet appareil et sera réessayé une fois la connexion rétablie.", es: "Modo sin conexión: tu trabajo permanece en este dispositivo y se reintentará al conectarte." },
    "network.checkingMessage": { en: "Checking connection. Your local work remains safe.", fr: "Vérification de la connexion. Votre travail local reste en sécurité.", es: "Comprobando la conexión. Tu trabajo local permanece seguro." },
    "tabs.home": { en: "Home", fr: "Accueil", es: "Inicio" },
    "tabs.tutor": { en: "Tutor", fr: "Tuteur", es: "Tutor" },
    "tabs.lab": { en: "Lab", fr: "Laboratoire", es: "Laboratorio" },
    "tabs.practice": { en: "Practice", fr: "Exercices", es: "Práctica" },
    "tabs.progress": { en: "Progress", fr: "Progrès", es: "Progreso" },
  };
  for (const [key, values] of Object.entries(entries)) for (const [locale, value] of Object.entries(values)) store.set(locale as SupportedLocale, key, value);
  return store;
}

export type PhysicsTerm = { id: string; english: string; translations: Partial<Record<SupportedLocale, string>> };
export const PHYSICS_TERMS: PhysicsTerm[] = [
  { id: "velocity", english: "velocity", translations: { fr: "vitesse", es: "velocidad", de: "Geschwindigkeit", ja: "速度", ar: "السرعة المتجهة", hi: "वेग" } },
  { id: "acceleration", english: "acceleration", translations: { fr: "accélération", es: "aceleración", de: "Beschleunigung", ja: "加速度", ar: "التسارع", hi: "त्वरण" } },
  { id: "force", english: "force", translations: { fr: "force", es: "fuerza", de: "Kraft", ja: "力", ar: "القوة", hi: "बल" } },
];

export function physicsTerm(id: string, locale: SupportedLocale): string {
  const term = PHYSICS_TERMS.find((candidate) => candidate.id === id);
  return term?.translations[resolveLocale(locale).code] ?? term?.english ?? id;
}

export const UNIT_LABELS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  m: { ar: "متر", ja: "メートル", hi: "मीटर" },
  s: { ar: "ثانية", ja: "秒", hi: "सेकंड" },
  N: { ar: "نيوتن", ja: "ニュートン", hi: "न्यूटन" },
  J: { ar: "جول", ja: "ジュール", hi: "जूल" },
};

export function unitLabel(unit: string, locale: SupportedLocale): string { return UNIT_LABELS[unit]?.[resolveLocale(locale).code] ?? unit; }
export function isRTL(locale: SupportedLocale): boolean { return resolveLocale(locale).direction === "rtl"; }
export function directionalStyle(locale: SupportedLocale): { direction: LocaleDirection } { return { direction: isRTL(locale) ? "rtl" : "ltr" }; }
export function languageInstruction(locale: SupportedLocale): string { return `Respond in ${resolveLocale(locale).nativeLabel}. Preserve equations, units, symbols, and variable names.`; }

function safeIntl<T>(fallback: string, format: () => string): string { try { return format(); } catch { return fallback; } }
export function formatNumber(value: number, locale: SupportedLocale): string { return safeIntl(String(value), () => new Intl.NumberFormat(resolveLocale(locale).code, { maximumFractionDigits: 3 }).format(value)); }
export function formatPercent(value: number, locale: SupportedLocale): string { return safeIntl(`${Math.round(value * 100)}%`, () => new Intl.NumberFormat(resolveLocale(locale).code, { style: "percent", maximumFractionDigits: 1 }).format(value)); }
export function formatScientific(value: number, locale: SupportedLocale): string { return safeIntl(String(value), () => new Intl.NumberFormat(resolveLocale(locale).code, { notation: "scientific", maximumSignificantDigits: 4 }).format(value)); }
export function formatDate(date: Date, locale: SupportedLocale): string { return safeIntl(date.toISOString().slice(0, 10), () => new Intl.DateTimeFormat(resolveLocale(locale).code, { dateStyle: "medium" }).format(date)); }
export function formatDateTime(value: Date | string, locale: SupportedLocale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return safeIntl(date.toISOString(), () => new Intl.DateTimeFormat(resolveLocale(locale).code, { dateStyle: "medium", timeStyle: "short" }).format(date));
}
