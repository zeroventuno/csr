// Meta delle 8 categorie di corsi mostrate nella pagina pubblica "Corsi".
// Le singole sessioni (Course) sono gestite dall'admin e collegate via categoryId.

export interface CourseCategory {
  id: string;
  icon: string; // classe phosphor
  title: string;
  age: string;
  intro: string;
  shortDesc: string; // usata nella griglia della home
}

export const CATEGORIES: CourseCategory[] = [
  {
    id: "babynuoto",
    icon: "ph-baby",
    title: "Babynuoto",
    age: "3–36 mesi",
    intro:
      "In acqua calda insieme a un genitore, per costruire un primo legame sereno e giocoso con l’ambiente acquatico.",
    shortDesc:
      "Acquaticità in acqua calda insieme a mamma o papà, per un primo legame sereno con l’acqua.",
  },
  {
    id: "mininuoto",
    icon: "ph-hand-waving",
    title: "Mininuoto",
    age: "3–5 anni",
    intro:
      "Approccio ludico e graduale all’acqua attraverso il gioco, per sviluppare confidenza e autonomia.",
    shortDesc: "Approccio ludico e graduale all’ambiente acquatico attraverso il gioco.",
  },
  {
    id: "nuoto-bambini",
    icon: "ph-person-simple-swim",
    title: "Nuoto Bambini",
    age: "6–13 anni",
    intro:
      "Tecnica, sicurezza e autonomia nei quattro stili, in piccoli gruppi suddivisi per livello.",
    shortDesc: "Tecnica, autonomia e sicurezza nei quattro stili in piccoli gruppi.",
  },
  {
    id: "nuoto-adulti",
    icon: "ph-person",
    title: "Nuoto Adulti",
    age: "14+ anni",
    intro:
      "Corsi per ogni livello, dal primo approccio al perfezionamento, con orari flessibili mattina e sera.",
    shortDesc: "Corsi per ogni livello, dal principiante al perfezionamento.",
  },
  {
    id: "acquagym",
    icon: "ph-barbell",
    title: "Acquagym",
    age: "Adulti",
    intro:
      "Allenamento total-body in acqua, a basso impatto articolare, con musica e istruttori certificati.",
    shortDesc: "Allenamento total-body in acqua, a basso impatto articolare.",
  },
  {
    id: "agonistica",
    icon: "ph-trophy",
    title: "Agonistica",
    age: "Su selezione",
    intro:
      "Squadre e preparazione alle gare del circuito federale FIN, con allenamenti strutturati e gare.",
    shortDesc: "Squadre e preparazione alle gare del circuito federale FIN.",
  },
  {
    id: "speciali",
    icon: "ph-heart",
    title: "Attività Speciali",
    age: "Tutte le età",
    intro:
      "Percorsi inclusivi, riabilitativi e di nuoto libero assistito, in collaborazione con personale specializzato.",
    shortDesc: "Percorsi inclusivi, riabilitativi e di nuoto libero assistito.",
  },
  {
    id: "vacanza",
    icon: "ph-sun",
    title: "Vacanza Sportiva",
    age: "6–14 anni",
    intro:
      "Centri estivi tra nuoto, giochi d’acqua e attività all’aperto, settimana per settimana da giugno a settembre.",
    shortDesc: "Centri estivi tra nuoto, giochi d’acqua e attività all’aperto.",
  },
];

export function getCategory(id: string): CourseCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
