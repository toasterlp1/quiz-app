
const WWM_FRAGEN = [

  { frage: "Welche Farbe hat eine Giraffe hauptsächlich?", antworten: ["Grau","Gelb-braun","Schwarz","Weiss"], richtig: 1 },
  { frage: "Wie viele Tage hat ein Schaltjahr?", antworten: ["364","365","366","367"], richtig: 2 },

  { frage: "Was ist die Hauptstadt von Deutschland?", antworten: ["München","Hamburg","Berlin","Köln"], richtig: 2 },
  { frage: "Wie viele Spieler stehen bei einem Fussballteam auf dem Feld?", antworten: ["9","10","11","12"], richtig: 2 },

  { frage: "Welches Tier ist das schnellste Landtier?", antworten: ["Löwe","Gepard","Antilope","Pferd"], richtig: 1 },
  { frage: "Wie heisst der grösste Ozean der Welt?", antworten: ["Atlantik","Indischer Ozean","Pazifik","Arktischer Ozean"], richtig: 2 },

  { frage: "Wie viele Kontinente gibt es?", antworten: ["5","6","7","8"], richtig: 2 },
  { frage: "Welches chemische Element hat das Symbol O?", antworten: ["Gold","Sauerstoff","Osmium","Eisen"], richtig: 1 },

  { frage: "Welcher Planet ist der Erde am nächsten?", antworten: ["Mars","Venus","Merkur","Jupiter"], richtig: 1 },
  { frage: "Wie viele Saiten hat eine klassische Gitarre?", antworten: ["4","5","6","7"], richtig: 2 },

  { frage: "Wer schrieb 'Faust'?", antworten: ["Friedrich Schiller","Johann Wolfgang von Goethe","Thomas Mann","Bertolt Brecht"], richtig: 1 },
  { frage: "In welchem Land steht der Eiffelturm?", antworten: ["Italien","Spanien","Frankreich","Belgien"], richtig: 2 },

  { frage: "Wie nennt man die Angst vor engen Räumen?", antworten: ["Akrophobie","Klaustrophobie","Arachnophobie","Agoraphobie"], richtig: 1 },
  { frage: "Welches Land hat die meisten Einwohner der Welt?", antworten: ["USA","Indien","China","Indonesien"], richtig: 1 },

  { frage: "Wie viele Kantone hat die Schweiz?", antworten: ["20","24","26","28"], richtig: 2 },
  { frage: "Wer malte die Mona Lisa?", antworten: ["Michelangelo","Raffael","Leonardo da Vinci","Donatello"], richtig: 2 },

  { frage: "Welches ist das grösste Land der Welt nach Fläche?", antworten: ["China","USA","Kanada","Russland"], richtig: 3 },
  { frage: "Wie viele Ringe hat das Symbol der Olympischen Spiele?", antworten: ["4","5","6","7"], richtig: 1 },

  { frage: "Welcher Fluss ist der längste der Welt?", antworten: ["Amazonas","Nil","Jangtse","Mississippi"], richtig: 1 },
  { frage: "Wie heisst der Prozess, bei dem Pflanzen Licht in Energie umwandeln?", antworten: ["Osmose","Photosynthese","Fotolyse","Transpiration"], richtig: 1 },

  { frage: "In welchem Jahr fiel die Berliner Mauer?", antworten: ["1987","1989","1991","1993"], richtig: 1 },
  { frage: "Welches Metall ist bei Zimmertemperatur flüssig?", antworten: ["Blei","Zink","Quecksilber","Zinn"], richtig: 2 },

  { frage: "Wer war der erste Mensch auf dem Mond?", antworten: ["Buzz Aldrin","Juri Gagarin","Neil Armstrong","John Glenn"], richtig: 2 },
  { frage: "Wie viele Knochen hat ein erwachsener Mensch normalerweise?", antworten: ["186","206","226","246"], richtig: 1 },

  { frage: "Welche Stadt war die erste Hauptstadt des Römischen Reichs?", antworten: ["Athen","Rom","Konstantinopel","Neapel"], richtig: 1 },
  { frage: "Wie heisst die kleinste Einheit der Materie, die noch chemische Eigenschaften trägt?", antworten: ["Molekül","Atom","Proton","Zelle"], richtig: 1 },

  { frage: "Wer komponierte die 9. Sinfonie mit dem 'Ode an die Freude'?", antworten: ["Mozart","Bach","Beethoven","Brahms"], richtig: 2 },
  { frage: "Welches Land besitzt die meisten Zeitzonen?", antworten: ["USA","Russland","Frankreich","China"], richtig: 1 },

  { frage: "Wie heisst die Theorie, die Raum, Zeit und Gravitation beschreibt und von Einstein stammt?", antworten: ["Quantentheorie","Relativitätstheorie","Stringtheorie","Chaostheorie"], richtig: 1 },
  { frage: "In welchem Jahr endete der Zweite Weltkrieg?", antworten: ["1943","1944","1945","1946"], richtig: 2 },

];

function wwmPunkte(index) {
  return Math.floor(index / 2) + 1;
}

if (typeof window !== 'undefined') {
  window.WWM_FRAGEN = WWM_FRAGEN;
  window.wwmPunkte = wwmPunkte;
}
