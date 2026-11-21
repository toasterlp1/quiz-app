const CATEGORIES = [
  { name: "FLAGGEN", icon: "🏳️", levels: {
    1: [{"frage":"Welche Flagge ist das?","antwort":"Portugal","bild":"https://flagcdn.com/w320/pt.png"}],
    2: [{"frage":"Welche Flagge ist das?","antwort":"Norwegen","bild":"https://flagcdn.com/w320/no.png"}],
    3: [{"frage":"Welche Flagge ist das?","antwort":"Chile","bild":"https://flagcdn.com/w320/cl.png"}],
    4: [{"frage":"Welche Flagge ist das?","antwort":"Nepal","bild":"https://flagcdn.com/w320/np.png"}],
  } },
  { name: "SCHÄTZFRAGEN", icon: "📏", levels: {
    1: [{"frage":"Wie viele Sekunden dauert eine Runde in Valorant maximal, ohne Spike-Plant?","antwort":"100 Sekunden (Toleranz: 95–105)"}],
    2: [{"frage":"Wie viele Folgen hat Breaking Bad insgesamt?","antwort":"62 (Toleranz: 59–65)"}],
    3: [{"frage":"Wie viele verschiedene Pokémon gab es in der ersten Generation?","antwort":"151 (Toleranz: 140–160)"}],
    4: [{"frage":"Wie viele Minuten dauern alle drei Herr-der-Ringe-Filme zusammen in der Kinofassung?","antwort":"558 Minuten (Toleranz: 540–575)"}],
  } },
  { name: "2000–2010ER FRAGEN", icon: "📼", levels: {
    1: [{"frage":"Welche Konsole brachte Nintendo 2006 raus?","antwort":"Wii"}],
    2: [{"frage":"In welchem Jahr wurde YouTube gegründet?","antwort":"2005"}],
    3: [{"frage":"Wie heißt der erste Teil der Assassin's-Creed-Reihe von 2007?","antwort":"Assassin's Creed"}],
    4: [{"frage":"Welche Band veröffentlichte 2003 den Song Numb?","antwort":"Linkin Park"}],
  } },
  { name: "RÄTSEL", icon: "🧩", levels: {
    1: [{"frage":"Welches Wort wird kürzer, wenn man zwei Buchstaben hinzufügt?","antwort":"Kurz → kürzer"}],
    2: [{"frage":"Was kommt einmal in jeder Minute, zweimal in jedem Moment, aber nie in tausend Jahren vor?","antwort":"Der Buchstabe M"}],
    3: [{"frage":"Was hat 13 Herzen, aber keine Organe?","antwort":"Ein Kartenspiel"}],
    4: [{"frage":"Was ist schwarz, wenn du es kaufst, rot, wenn du es benutzt, und grau, wenn du es wegwirfst?","antwort":"Holzkohle"}],
  } },
  { name: "GAMING", icon: "🎮", levels: {
    1: [{"frage":"Wie heißt der Hauptcharakter aus God of War?","antwort":"Kratos"}],
    2: [{"frage":"Wie heißt die Hauptstadt der Pokémon-Region Kanto?","antwort":"Vertania City"}],
    3: [{"frage":"Aus welchem Spiel stammt die Organisation Umbrella Corporation?","antwort":"Resident Evil"}],
    4: [{"frage":"In welchem Spiel spielt man den Detektiv Harry Du Bois?","antwort":"Disco Elysium"}],
  } },
  { name: "KINDERSERIEN INTRO", icon: "🎵", levels: {
    1: [{"frage":"Zu welcher Kinderserie gehört dieses Intro?","antwort":"Cosmo & Wanda","audio":"audio/intro-100.mp3","audioDuration":5}],
    2: [{"frage":"Zu welcher Kinderserie gehört dieses Intro?","antwort":"Kim Possible","audio":"audio/intro-200.mp3","audioDuration":5}],
    3: [{"frage":"Zu welcher Kinderserie gehört dieses Intro?","antwort":"Hannah Montana","audio":"audio/intro-300.mp3","audioDuration":5}],
    4: [{"frage":"Zu welcher Kinderserie gehört dieses Intro?","antwort":"Coop gegen Cat","audio":"audio/intro-500.mp3","audioDuration":5}],
  } },
  { name: "ERKENNE DEN STREAMER", icon: "🎙️", levels: {
    1: [{"frage":"Welchen Streamer hörst du?","antwort":"Krokoboss","audio":"audio/streamer-100.mp3","audioDuration":5}],
    2: [{"frage":"Welchen Streamer hörst du?","antwort":"BastiGHG","audio":"audio/streamer-200.mp3","audioDuration":5}],
    3: [{"frage":"Welchen Streamer hörst du?","antwort":"Rosemondy","audio":"audio/streamer-300.mp3","audioDuration":5}],
    4: [{"frage":"Welchen Streamer hörst du?","antwort":"Elquaria","audio":"audio/streamer-500.mp3","audioDuration":5}],
  } },
  { name: "ANIME", icon: "🎌", levels: {
    1: [{"frage":"Wie heißt der jüngere Bruder von Edward Elric?","antwort":"Alphonse Elric"}],
    2: [{"frage":"Wie heißt die Organisation, die in Naruto nach den Bijū jagt?","antwort":"Akatsuki"}],
    3: [{"frage":"Wie heißt die erste Säule, auf die Tanjiro in Demon Slayer trifft?","antwort":"Giyu Tomioka"}],
    4: [{"frage":"Wie heißt der ehemalige Kapitän der 5. Division, der die Soul Society verrät?","antwort":"Sōsuke Aizen"}],
  } },
  { name: "ESSEN UND TRINKEN", icon: "🍽️", levels: {
    1: [{"frage":"Aus welchem Land kommt Paella?","antwort":"Spanien"}],
    2: [{"frage":"Wie heißt die Paste, die man oft zu Sushi bekommt?","antwort":"Wasabi"}],
    3: [{"frage":"Welches Land ist für das Gericht Bibimbap bekannt?","antwort":"Südkorea"}],
    4: [{"frage":"Welches Gewürz gibt Risotto alla Milanese seine gelbe Farbe?","antwort":"Safran"}],
  } },
  { name: "POP-SHARDS", icon: "💿", levels: {
    1: [{"frage":"Welchen Song hörst du?","antwort":"Beauty And A Beat – Justin Biber","audio":"audio/pop-100.mp3","audioDuration":5}],
    2: [{"frage":"Welchen Song hörst du?","antwort":"Crazy In Love - Beyoncé","audio":"audio/pop-200.mp3","audioDuration":5}],
    3: [{"frage":"Welchen Song hörst du?","antwort":"Cruel Summer – Taylor Swift","audio":"audio/pop-300.mp3","audioDuration":5}],
    4: [{"frage":"Welchen Song hörst du?","antwort":"Can_t Feel My Face - The Weekend","audio":"audio/pop-500.mp3","audioDuration":5}],
  } },
  { name: "ABKÜRZUNGEN", icon: "🔤", levels: {
    1: [{"frage":"Wie kürzt man Grafikkarten-Prozessor ab?","antwort":"GPU"}],
    2: [{"frage":"Wofür steht USB?","antwort":"Universal Serial Bus"}],
    3: [{"frage":"Wofür steht LAN?","antwort":"Local Area Network"}],
    4: [{"frage":"Wofür steht BIOS?","antwort":"Basic Input/Output System"}],
  } },
  { name: "FILME & SERIEN", icon: "🎬", levels: {
    1: [{"frage":"Wie heißt die Zauberschule aus Harry Potter?","antwort":"Hogwarts"}],
    2: [{"frage":"Wie heißt das Spiel, das in Squid Game als Erstes gespielt wird?","antwort":"Rotes Licht, grünes Licht"}],
    3: [{"frage":"Wie heißt das Königreich, über das Simba in Der König der Löwen herrscht?","antwort":"Das Geweihte Land"}],
    4: [{"frage":"Wie heißt die Parallelwelt aus Stranger Things?","antwort":"Upside Down"}],
  } },
];
