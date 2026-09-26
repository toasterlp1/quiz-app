const WWM_FRAGEN = [

  // STUFE 1
  { frage: "Wer lebt in einer Ananas?", antworten: ["Patrick","SpongeBob","Garfield","Homer"], richtig: 1 },
  { frage: "Wo streamt man hauptsächlich live?", antworten: ["Netflix","Twitch","Spotify","Wikipedia"], richtig: 1 },

  // STUFE 2
  { frage: "Wer ist Peter Parker?", antworten: ["Batman","Superman","Spider-Man","Iron Man"], richtig: 2 },
  { frage: "Wo gibt's den Big Mac?", antworten: ["KFC","Subway","McDonald's","Burger King"], richtig: 2 },

  // STUFE 3
  { frage: "Wie heißt Harry Potters Schule?", antworten: ["Hogwarts","Narnia","Nevermore","Winterfell"], richtig: 0 },
  { frage: "Wer ist Marios Bruder?", antworten: ["Wario","Luigi","Toad","Yoshi"], richtig: 1 },

  // STUFE 4
  { frage: "In welcher Serie gibt's die Stadt Hawkins?", antworten: ["Lost","Stranger Things","Dark","The Walking Dead"], richtig: 1 },
  { frage: "Wer singt 'Blinding Lights'?", antworten: ["Drake","Bruno Mars","The Weeknd","Post Malone"], richtig: 2 },

  // STUFE 5
  { frage: "Welche Pille nimmt Neo in Matrix?", antworten: ["Die rote","Die blaue","Die grüne","Die gelbe"], richtig: 0 },
  { frage: "In welcher Stadt spielt GTA V?", antworten: ["Vice City","Liberty City","Los Santos","San Fierro"], richtig: 2 },

  // STUFE 6
  { frage: "Wer spielt Jack Sparrow?", antworten: ["Brad Pitt","Johnny Depp","Tom Cruise","Matt Damon"], richtig: 1 },
  { frage: "Welche Nummer hat Pikachu im Pokédex?", antworten: ["10","25","50","100"], richtig: 1 },

  // STUFE 7
  { frage: "Wie nennt sich Walter White selbst?", antworten: ["Heisenberg","Scarface","Capone","Goodman"], richtig: 0 },
  { frage: "Von wem kommt die PlayStation?", antworten: ["Nintendo","Microsoft","Sony","Sega"], richtig: 2 },

  // STUFE 8
  { frage: "Welcher Film ist von Christopher Nolan?", antworten: ["Inception","Gladiator","Fight Club","Pulp Fiction"], richtig: 0 },
  { frage: "Wer war der 'King of Pop'?", antworten: ["Prince","Michael Jackson","Elvis Presley","Freddie Mercury"], richtig: 1 },

  // STUFE 9
  { frage: "Auf welchem Kontinent liegt Königsmund?", antworten: ["Essos","Westeros","Valyria","Sothoryos"], richtig: 1 },
  { frage: "Wer hat Minecraft entwickelt?", antworten: ["Valve","Mojang","Ubisoft","Epic Games"], richtig: 1 },

  // STUFE 10
  { frage: "Wer spielt Iron Man?", antworten: ["Chris Evans","Robert Downey Jr.","Chris Hemsworth","Mark Ruffalo"], richtig: 1 },
  { frage: "Wer wurde 2014 Fußball-Weltmeister?", antworten: ["Brasilien","Deutschland","Frankreich","Argentinien"], richtig: 1 },

  // STUFE 11
  { frage: "Wie heißt die Firma aus Jurassic Park?", antworten: ["InGen","Umbrella","Weyland","Cyberdyne"], richtig: 0 },
  { frage: "Von wem ist 'Smells Like Teen Spirit'?", antworten: ["Green Day","Nirvana","Metallica","Linkin Park"], richtig: 1 },

  // STUFE 12
  { frage: "Wer malte 'Die Sternennacht'?", antworten: ["Picasso","Monet","Van Gogh","Dalí"], richtig: 2 },
  { frage: "Wie heißt die KI aus '2001'?", antworten: ["TARS","HAL 9000","JARVIS","VIKI"], richtig: 1 },

  // STUFE 13
  { frage: "Welches Land hat die längste Küste?", antworten: ["Russland","Kanada","Australien","Indonesien"], richtig: 1 },
  { frage: "Wer kam zuerst?", antworten: ["Sonic","Mario","Lara Croft","Crash"], richtig: 1 },

  // STUFE 14
  { frage: "Wer hat 'Pulp Fiction' gedreht?", antworten: ["Scorsese","Tarantino","Fincher","Spielberg"], richtig: 1 },
  { frage: "Welche Zahl ist binär '1010'?", antworten: ["8","10","12","14"], richtig: 1 },

  // STUFE 15
  { frage: "Welches Spiel kam zuerst?", antworten: ["Doom","Quake","Diablo","Half-Life"], richtig: 0 },
  { frage: "Welche Nationalflagge ist nicht viereckig?", antworten: ["Bhutan","Nepal","Sri Lanka","Mongolei"], richtig: 1 }

];

function wwmPunkte(index) {
  return Math.floor(index / 2) + 1;
}

if (typeof window !== 'undefined') {
  window.WWM_FRAGEN = WWM_FRAGEN;
  window.wwmPunkte = wwmPunkte;
}
