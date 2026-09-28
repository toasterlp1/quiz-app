const CATEGORIES = [
  {
    name: "FLAGGEN",
    icon: "🏴",
    levels: {
      1: [{ frage: "Welche Flagge ist das?", antwort: "Frankreich", bild: "https://flagcdn.com/w320/fr.png" }],
      2: [{ frage: "Welche Flagge ist das?", antwort: "Südkorea", bild: "https://flagcdn.com/w320/kr.png" }],
      3: [{ frage: "Welche Flagge ist das?", antwort: "Argentinien", bild: "https://flagcdn.com/w320/ar.png" }],
      4: [{ frage: "Welche Flagge ist das?", antwort: "Sri Lanka", bild: "https://flagcdn.com/w320/lk.png" }],
      5: [{ frage: "Welche Flagge ist das?", antwort: "Mosambik", bild: "https://flagcdn.com/w320/mz.png" }],
    },
  },
  {
    name: "HAUPTSTÄDTE",
    icon: "🏙️",
    levels: {
      1: [{ frage: "Was ist die Hauptstadt von Italien?", antwort: "Rom" }],
      2: [{ frage: "Was ist die Hauptstadt von Kanada?", antwort: "Ottawa" }],
      3: [{ frage: "Was ist die Hauptstadt von Australien?", antwort: "Canberra" }],
      4: [{ frage: "Was ist die Hauptstadt von Kasachstan?", antwort: "Astana" }],
      5: [{ frage: "Was ist die Hauptstadt des Sudan?", antwort: "Khartum" }],
    },
  },
  {
    name: "SERIEN",
    icon: "📺",
    levels: {
      1: [{ frage: "Wie heißt die Firma, in der The Office hauptsächlich spielt?", antwort: "Dunder Mifflin" }],
      2: [{ frage: "Welchen Beruf hat Ted Mosby in How I Met Your Mother?", antwort: "Architekt" }],
      3: [{ frage: "Wie heißt das Gefängnis, in dem die erste Staffel von Prison Break spielt?", antwort: "Fox River" }],
      4: [{ frage: "Welche Serie spielt im Hawkins der 1980er?", antwort: "Stranger Things" }],
      5: [{ frage: "Welche Serie dreht sich um den Serienmörder Trinity?", antwort: "Dexter" }],
    },
  },
  {
    name: "AB INS KINO",
    icon: "🎬",
    levels: {
      1: [{ frage: "Wie heißt das Hotel in The Shining?", antwort: "Overlook Hotel" }],
      2: [{ frage: "Welcher Regisseur drehte Inception, Interstellar und Dunkirk?", antwort: "Christopher Nolan" }],
      3: [{ frage: "In welchem Film müssen Träume innerhalb von Träumen manipuliert werden?", antwort: "Inception" }],
      4: [{ frage: "Welcher Film handelt von einem Mann, dessen gesamtes Leben heimlich als TV-Show ausgestrahlt wird?", antwort: "Die Truman Show" }],
      5: [{ frage: "In welchem Film kommuniziert die Menschheit über eine außerirdische Sprache mit Besuchern?", antwort: "Arrival" }],
    },
  },
  {
    name: "GAMING",
    icon: "🎮",
    levels: {
      1: [{ frage: "Wie heißt Riots Shooter?", antwort: "Valorant" }],
      2: [{ frage: "Wie heißt Nintendos erfolgreichste Spielreihe?", antwort: "Mario (Gesamtes Franchise)" }],
      3: [{ frage: "Von welchem Entwicklerstudio stammt Elden Ring?", antwort: "FromSoftware" }],
      4: [{ frage: "Welches berühmte Spiel, in dem Night City der Hauptschauplatz ist, basiert auf einem Anime?", antwort: "Cyberpunk 2077" }],
      5: [{ frage: "In welchem Spiel wird der verschwundene Sohn Shaun gesucht?", antwort: "Fallout 4" }],
    },
  },
  {
    name: "SPRICHWÖRTER",
    icon: "💬",
    levels: {
      1: [{ frage: "Wer im Glashaus sitzt, ...", antwort: "sollte nicht mit Steinen werfen" }],
      2: [{ frage: "Morgenstund ...", antwort: "hat Gold im Mund" }],
      3: [{ frage: "Wer zuletzt lacht, ...?", antwort: "lacht am besten" }],
      4: [{ frage: "Wo Rauch ist, ...?", antwort: "ist auch Feuer" }],
      5: [{ frage: "Unverhofft ...?", antwort: "kommt oft" }],
    },
  },
  {
    name: "RÄTSEL",
    icon: "🧩",
    levels: {
      1: [{ frage: "Je mehr du von mir wegnimmst, desto größer werde ich. Was bin ich?", antwort: "Ein Loch" }],
      2: [{ frage: "Ich gehöre dir, aber andere benutzen mich häufiger als du. Was bin ich?", antwort: "Dein Name" }],
      3: [{ frage: "Ich kann um die ganze Welt reisen und bleibe trotzdem in einer Ecke. Was bin ich?", antwort: "Eine Briefmarke" }],
      4: [{ frage: "Was kann man brechen, ohne es jemals anzufassen?", antwort: "Ein Versprechen" }],
      5: [{ frage: "Zwei Väter und zwei Söhne gehen angeln. Jeder fängt genau einen Fisch, trotzdem werden nur drei Fische gefangen. Wie ist das möglich?", antwort: "Es sind drei Personen: Großvater, Vater und Sohn" }],
    },
  },
  {
    name: "ANIME",
    icon: "🎌",
    levels: {
      1: [{ frage: "Wie heißt Narutos Heimatdorf?", antwort: "Konohagakure (Konoha)" }],
      2: [{ frage: "Welcher Anime handelt von Piraten?", antwort: "Akatsuki" }],
      3: [{ frage: "Wie heisst die Freundin von Light Yagami aus Death Note?", antwort: "Misa Aname" }],
      4: [{ frage: "Wie heißt der Vater von Gon in Hunter x Hunter?", antwort: "Ging Freecss" }],
      5: [{ frage: "Wie heißt das Schwert, das Ichigo in Bleach führt??", antwort: "Zangetsu" }],
    },
  },
  {
    name: "ESSEN & TRINKEN",
    icon: "🍽️",
    levels: {
      1: [{ frage: "Aus welchem Land stammt Sushi ursprünglich?", antwort: "Japan" }],
      2: [{ frage: "Wie heißt die italienische Nachspeise aus Mascarpone, Kaffee und Löffelbiskuits?", antwort: "Tiramisu" }],
      3: [{ frage: "Wie heißt die japanische Würzpaste aus fermentierten Sojabohnen?", antwort: "Miso" }],
      4: [{ frage: "Was ist die Hauptzutat von Marzipan?", antwort: "Mandel" }],
      5: [{ frage: "Welches Gewürz wird aus einer Krokusblüte gewonnen?", antwort: "Safran" }],
    },
  },
  {
    name: "SPRACHEN",
    icon: "🌐",
    levels: {
      1: [{ frage: "Welche Sprache hörst du?", antwort: "Spanisch", audio: "audio/sprache-100.mp3" }],
      2: [{ frage: "Welche Sprache hörst du?", antwort: "Französisch", audio: "audio/sprache-200.mp3" }],
      3: [{ frage: "Welche Sprache hörst du?", antwort: "Niederländisch", audio: "audio/sprache-300.mp3" }],
      4: [{ frage: "Welche Sprache hörst du?", antwort: "Tschechisch", audio: "audio/sprache-400.mp3" }],
      5: [{ frage: "Welche Sprache hörst du?", antwort: "Finnisch", audio: "audio/sprache-500.mp3" }],
    },
  },
  {
    name: "ERKENNE DEN STREAMER",
    icon: "🎙️",
    levels: {
      1: [{ frage: "Welchen Streamer hörst du?", antwort: "MontanaBlack", audio: "audio/streamer-100.mp3" }],
      2: [{ frage: "Welchen Streamer hörst du?", antwort: "Papaplatte", audio: "audio/streamer-200.mp3" }],
      3: [{ frage: "Welchen Streamer hörst du?", antwort: "Knossi", audio: "audio/streamer-300.mp3" }],
      4: [{ frage: "Welchen Streamer hörst du?", antwort: "Trymacs", audio: "audio/streamer-400.mp3" }],
      5: [{ frage: "Welchen Streamer hörst du?", antwort: "Elotrix", audio: "audio/streamer-500.mp3" }],
    },
  },
  {
    name: "KINDERSERIEN-INTRO",
    icon: "🎵",
    levels: {
      1: [{ frage: "Zu welcher Kinderserie gehört dieses Intro?", antwort: "SpongeBob Schwammkopf", audio: "audio/intro-100.mp3", audioStart: 0, audioDuration: 8 }],
      2: [{ frage: "Zu welcher Kinderserie gehört dieses Intro?", antwort: "Gravity Falls", audio: "audio/intro-200.mp3", audioStart: 0, audioDuration: 8 }],
      3: [{ frage: "Zu welcher Kinderserie gehört dieses Intro?", antwort: "Phineas und Ferb", audio: "audio/intro-300.mp3", audioStart: 0, audioDuration: 8 }],
      4: [{ frage: "Zu welcher Kinderserie gehört dieses Intro?", antwort: "Die Gummibärenbande", audio: "audio/intro-400.mp3", audioStart: 0, audioDuration: 8 }],
      5: [{ frage: "Zu welcher Kinderserie gehört dieses Intro?", antwort: "Art Attack", audio: "audio/intro-500.mp3", audioStart: 0, audioDuration: 8 }],
    },
  },
];
