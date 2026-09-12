// Quizduell – 21 Kategorien, exakt 1 Frage pro Level
// FLAGGEN enthält wieder direkte Flaggenbilder über flagcdn.com.

const CATEGORIES = [
  {
    name: "FLAGGEN",
    icon: "🏴",
    levels: {
      1: [{ frage: "Welche Flagge ist das?", antwort: "Deutschland", bild: "https://flagcdn.com/w320/de.png" }],
      2: [{ frage: "Welche Flagge ist das?", antwort: "Japan", bild: "https://flagcdn.com/w320/jp.png" }],
      3: [{ frage: "Welche Flagge ist das?", antwort: "Kanada", bild: "https://flagcdn.com/w320/ca.png" }],
      4: [{ frage: "Welche Flagge ist das?", antwort: "Bhutan", bild: "https://flagcdn.com/w320/bt.png" }],
      5: [{ frage: "Welche Flagge ist das?", antwort: "Nepal", bild: "https://flagcdn.com/w320/np.png" }],
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
    name: "TIERE",
    icon: "🐾",
    levels: {
      1: [{ frage: "Was ist das größte Landtier?", antwort: "Elefant" }],
      2: [{ frage: "Wie nennt man ein Reh-Jungtier?", antwort: "Kitz" }],
      3: [{ frage: "Welches Säugetier kann fliegen?", antwort: "Fledermaus" }],
      4: [{ frage: "Welcher Vogel kann rückwärts fliegen?", antwort: "Kolibri" }],
      5: [{ frage: "Wie viele Herzen hat ein Oktopus?", antwort: "3" }],
    },
  },
  {
    name: "ESSEN & TRINKEN",
    icon: "🍽️",
    levels: {
      1: [{ frage: "Aus welchem Land stammt Pizza?", antwort: "Italien" }],
      2: [{ frage: "Woraus wird Hummus gemacht?", antwort: "Kichererbsen" }],
      3: [{ frage: "Aus welchem Land stammt Feta-Käse ursprünglich?", antwort: "Griechenland" }],
      4: [{ frage: "Welche Paste wird aus fermentierten Sojabohnen gemacht?", antwort: "Miso" }],
      5: [{ frage: "Wie heißt die Bräunungsreaktion beim Erhitzen von Zucker?", antwort: "Karamellisierung" }],
    },
  },
  {
    name: "AB INS KINO",
    icon: "🎬",
    levels: {
      1: [{ frage: "Aus welchem Disney-Film stammt das Lied 'Probier's mal mit Gemütlichkeit'?", antwort: "Das Dschungelbuch" }],
      2: [{ frage: "Wie heißt der erste Herr-der-Ringe-Film?", antwort: "Die Gefährten" }],
      3: [{ frage: "Welches Tier ist auf dem Wappen von Slytherin?", antwort: "Schlange" }],
      4: [{ frage: "In welcher Filmreihe reisen die Hauptfiguren mit einem umgebauten Auto durch die Zeit?", antwort: "Zurück in die Zukunft" }],
      5: [{ frage: "Wie heißt der grüne Oger, dessen bester Freund ein sprechender Esel ist?", antwort: "Shrek" }],
    },
  },
  {
    name: "SERIEN",
    icon: "📺",
    levels: {
      1: [{ frage: "Wie heißt die Stadt aus Die Simpsons?", antwort: "Springfield" }],
      2: [{ frage: "Wie heißt Walter Whites Deckname?", antwort: "Heisenberg" }],
      3: [{ frage: "Welche Serie spielt in Westeros?", antwort: "Game of Thrones" }],
      4: [{ frage: "Welche Zeichentrickserie spielt in einer Stadt am Meeresgrund?", antwort: "SpongeBob Schwammkopf" }],
      5: [{ frage: "Welche Serie handelt von vier hochbegabten Physikern und ihrer neuen Nachbarin?", antwort: "The Big Bang Theory" }],
    },
  },
  {
    name: "ANIME",
    icon: "🎌",
    levels: {
      1: [{ frage: "Wie heißt der Hauptcharakter von One Piece?", antwort: "Monkey D. Luffy" }],
      2: [{ frage: "Welche Art von Wesen ist Pikachu?", antwort: "Pokémon" }],
      3: [{ frage: "In welchem Anime bekämpfen sich zwei Brüder mittels Alchemie?", antwort: "Fullmetal Alchemist" }],
      4: [{ frage: "Welcher Anime handelt von einer professionellen Helden-Akademie?", antwort: "My Hero Academia" }],
      5: [{ frage: "In welchem Anime verwandeln sich Menschen durch Insekten-Parasiten?", antwort: "Parasyte" }],
    },
  },
  {
    name: "GAMING",
    icon: "🎮",
    levels: {
      1: [{ frage: "In welchem Spiel rettet man eine Prinzessin vor einer Riesenschildkröte?", antwort: "Super Mario Bros." }],
      2: [{ frage: "In welchem Spiel baut man Welten aus Blöcken?", antwort: "Minecraft" }],
      3: [{ frage: "Wie heißt der Held aus The Legend of Zelda?", antwort: "Link" }],
      4: [{ frage: "Welches Studio entwickelte Dark Souls?", antwort: "FromSoftware" }],
      5: [{ frage: "Wie heißt die Stadt in GTA V?", antwort: "Los Santos" }],
    },
  },
  {
    name: "MUSIK",
    icon: "🎵",
    levels: {
      1: [{ frage: "Wie viele Tasten hat ein Klavier?", antwort: "88" }],
      2: [{ frage: "Welche Pop-Band besteht aus zwei Männern und zwei Frauen?", antwort: "ABBA" }],
      3: [{ frage: "Wer sang Thriller?", antwort: "Michael Jackson" }],
      4: [{ frage: "Wer komponierte die 9. Sinfonie?", antwort: "Beethoven" }],
      5: [{ frage: "Welcher deutscher Rapper tritt nur mit einer Pandamaske auf?", antwort: "Cro" }],
    },
  },
  {
    name: "WER BIN ICH?",
    icon: "❓",
    levels: {
      1: [{ frage: "Ich entwickelte die Relativitätstheorie?", antwort: "Albert Einstein" }],
      2: [{ frage: "Ich bin ein Geheimagent mit der Lizenz zum Töten.", antwort: "James Bond" }],
      3: [{ frage: "Wer war der erste Mensch auf dem Mond?", antwort: "Neil Armstrong" }],
      4: [{ frage: "Ich spielte Captain Jack Sparrow in Fluch der Karibik.", antwort: "Johnny Depp" }],
      5: [{ frage: "Ich war der erste Präsident der Vereinigten Staaten.", antwort: "George Washington" }],
    },
  },
  {
    name: "SPRICHWÖRTER",
    icon: "💬",
    levels: {
      1: [{ frage: "Zu viele Köche...?", antwort: "verderben den Brei" }],
      2: [{ frage: "Was du heute kannst besorgen, ...?", antwort: "das verschiebe nicht auf morgen" }],
      3: [{ frage: "Hochmut kommt ...?", antwort: "vor dem Fall" }],
      4: [{ frage: "Wer anderen eine Grube gräbt, ...?", antwort: "fällt selbst hinein" }],
      5: [{ frage: "Morgenstund ...?", antwort: " hat Gold im Mund" }],
    },
  },
  {
    name: "RÄTSEL",
    icon: "🧩",
    levels: {
      1: [{ frage: "Was wird nass, während es trocknet?", antwort: "Handtuch" }],
      2: [{ frage: "Was hat ein Loch und kann Wasser halten?", antwort: "Schwamm" }],
      3: [{ frage: "Was hat Tasten, aber keine Schlösser?", antwort: "Klavier" }],
      4: [{ frage: "Was hat Städte, aber keine Häuser?", antwort: "Karte" }],
      5: [{ frage: "Was hat einen Hals, aber keinen Kopf?", antwort: "Flasche" }],
    },
  },
  {
    name: "WAHR ODER FALSCH",
    icon: "⚖️",
    levels: {
      1: [{ frage: "Ein Mensch hat vier Lungen.", antwort: "Falsch" }],
      2: [{ frage: "Der Eiffelturm wird bei Hitze größer.", antwort: "Wahr" }],
      3: [{ frage: "Fledermäuse sind vollständig blind.", antwort: "Falsch" }],
      4: [{ frage: "Ein Oktopus hat drei Herzen.", antwort: "Wahr" }],
      5: [{ frage: "Ein Blitz kann heißer sein als die Oberfläche der Sonne.", antwort: "Wahr" }],
    },
  },
  {
    name: "SCHÄTZFRAGEN",
    icon: "📏",
    levels: {
      1: [{ frage: "Wie viele Knochen hat ein erwachsener Mensch?", antwort: "206" }],
      2: [{ frage: "Wie lang ist der Erdumfang ungefähr?", antwort: "40.000 km" }],
      3: [{ frage: "Wie tief ist der Marianengraben ungefähr?", antwort: "11.000 m" }],
      4: [{ frage: "Wie viel Blut hat ein Erwachsener ungefähr?", antwort: "5 Liter" }],
      5: [{ frage: "Wie alt ist die Erde ungefähr?", antwort: "4,5 Milliarden Jahre" }],
    },
  },
  {
    name: "GESCHICHTE",
    icon: "🏛️",
    levels: {
      1: [{ frage: "In welchem Jahr fiel die Berliner Mauer?", antwort: "1989" }],
      2: [{ frage: "Welche antike Stadt wurde durch einen Vulkanausbruch verschüttet?", antwort: "Pompeji" }],
      3: [{ frage: "Wie hießen die Herrscher im alten Ägypten?", antwort: "Pharaonen" }],
      4: [{ frage: "In welchem Jahrhundert wurde Amerika von Kolumbus entdeckt?", antwort: "15. Jahrhundert" }],
      5: [{ frage: "Welcher französische Herrscher verlor die Schlacht bei Waterloo?", antwort: "Napoleon" }],
    },
  },
  {
    name: "MYTHOLOGIE",
    icon: "⚡",
    levels: {
      1: [{ frage: "Wer ist der griechische Gott des Meeres?", antwort: "Poseidon" }],
      2: [{ frage: "Welcher nordische Gott trägt Mjölnir?", antwort: "Thor" }],
      3: [{ frage: "Wie heißt der Höllenhund der griechischen Mythologie?", antwort: "Kerberos" }],
      4: [{ frage: "Wie heißt das Schwert von König Artus?", antwort: "Excalibur" }],
      5: [{ frage: "Wer tötete den Minotaurus?", antwort: "Theseus" }],
    },
  },
  {
    name: "MÄRCHEN",
    icon: "👑",
    levels: {
      1: [{ frage: "Wer verliert einen gläsernen Schuh?", antwort: "Aschenputtel" }],
      2: [{ frage: "Wer schläft hinter sieben Bergen?", antwort: "Schneewittchen" }],
      3: [{ frage: "Wer trägt einen roten Umhang?", antwort: "Rotkäppchen" }],
      4: [{ frage: "Wer lebt in einem Turm mit langem Haar?", antwort: "Rapunzel" }],
      5: [{ frage: "Wer verlangt im Märchen das erstgeborene Kind?", antwort: "Rumpelstilzchen" }],
    },
  },
  {
    name: "SPRACHEN",
    icon: "🌐",
    levels: {
      1: [{ frage: "Wie heißt Danke auf Englisch?", antwort: "Thank you" }],
      2: [{ frage: "Welche Sprache spricht man in Brasilien?", antwort: "Portugiesisch" }],
      3: [{ frage: "Was bedeutet Bonjour?", antwort: "Guten Tag" }],
      4: [{ frage: "Aus welcher Sprache stammt Karaoke?", antwort: "Japanisch" }],
      5: [{ frage: "Welche Sprache hat die meisten Muttersprachler?", antwort: "Chinesisch" }],
    },
  },
  {
    name: "KUNST & BÜCHER",
    icon: "📚",
    levels: {
      1: [{ frage: "Wer malte die Mona Lisa?", antwort: "Leonardo da Vinci" }],
      2: [{ frage: "Wer schrieb Harry Potter?", antwort: "J. K. Rowling" }],
      3: [{ frage: "Wer schrieb 1984?", antwort: "George Orwell" }],
      4: [{ frage: "Wer malte Die Sternennacht?", antwort: "Vincent van Gogh" }],
      5: [{ frage: "Wer schrieb Der Name der Rose?", antwort: "Umberto Eco" }],
    },
  },
  {
    name: "SPORT",
    icon: "🏆",
    levels: {
      1: [{ frage: "Wie viele Spieler stehen bei einer Fußballmannschaft regulär gleichzeitig auf dem Feld?", antwort: "11" }],
      2: [{ frage: "Wie viele Punkte ist ein Touchdown im American Football wert?", antwort: "6" }],
      3: [{ frage: "In welcher Sportart wird um den Stanley Cup gespielt?", antwort: "Eishockey" }],
      4: [{ frage: "Wie lang ist ein olympisches Schwimmbecken?", antwort: "50 Meter" }],
      5: [{ frage: "Welche Nation gewann die erste Fußball-Weltmeisterschaft 1930?", antwort: "Uruguay" }],
    },
  },
  {
    name: "WISSENSCHAFT",
    icon: "🔬",
    levels: {
      1: [{ frage: "Welcher Planet ist der Sonne am nächsten?", antwort: "Merkur" }],
      2: [{ frage: "Welches chemische Symbol hat Gold?", antwort: "Au" }],
      3: [{ frage: "Wie heißt die Einheit der elektrischen Stromstärke?", antwort: "Ampere" }],
      4: [{ frage: "Welches Element hat die Ordnungszahl 6?", antwort: "Kohlenstoff" }],
      5: [{ frage: "Wie heißt der Prozess, bei dem ein Atomkern in zwei kleinere Kerne zerfällt?", antwort: "Kernspaltung" }],
    },
  },

];
