import { z } from "zod";

export const FishVoicesEnum = {
  Eneas: "eneas",
  TobeyMaguire: "tobey-maguire",
  WilliamBonner: "william-bonner",
  WaldoMoraes: "waldo-moraes",
  Cava: "cava",
  HomerSimpson: "homer-simpson",
  Sukuna: "sukuna",
  JorgeIgor: "jorge-igor",
  Locutor: "locutor",
  Peninha: "peninha",
  GohanCrianca: "gohan-crianca",
  Goku: "goku",
  LulaFlavioCosta: "lula-flavio-costa",
  BolsonaroFlavioCosta: "bolsonaro-flavio-costa",
  Maurilio: "maurilio",
  Vegeta: "vegeta",
  NarradorChris: "narrador-chris",
  DonaldTrump: "donald-trump",
  CapitaoNascimento: "capitao-nascimento",
  LulaFranciscoJunior: "lula-francisco-junior",
  CleberMachado: "cleber-machado",
  Coringa: "coringa",
  BolsonaroBrunoVieira: "bolsonaro-bruno-vieira",
  RickSanchez: "rick-sanchez",
  RickSanchezPrimeiraTemporada: "rick-sanchez-primeira-temporada",
  PeterGriffin: "peter-griffin",
  MortyEn: "morty-en",
  MortySmith: "morty-smith",
  RickEn: "rick-en",
  RickSanchezEn: "rick-sanchez-en",
  PeterGriffinEn: "peter-griffin-en",
  MorganFreemanEn: "morgan-freeman-en",
  ElonEn: "elon-en",
  MortalKombatEn: "mortal-kombat-en",
  IngloriousBsterdsEn: "inglorious-bsterds-en",
  AH64ApacheCPG2En: "ah-64-apache-cpg-2-en",
  AH64ApacheCPGEn: "ah-64-apache-cpg-en",
  HomelanderEn: "homelander-en",
  Pateta: "pateta",
  CapitaoPatria: "capitao-patria",
  MickeyMouse: "mickey-mouse",
  ObitoJp: "obito-jp",
  MadaraJp: "madara-jp",
  Pain1Jp: "pain-1-jp",
  Pain2Jp: "pain-2-jp",
  Primeagen: "primeagen",
  Guerrinha: "guerrinha",
  Samir: "samir",
  BobEsponja: "bob-esponja",
  Sasuke: "sasuke",
  Cartman: "cartman",
  Stewie: "stewie",
  ItoshiSae: "itoshi-sae",
  SatoruGojo: "satoru-gojo",
  Anya: "anya",
  GalvaoBueno: "galvao-bueno",
  NarutoJp: "naruto-jp",
  Obito2Jp: "obito-2-jp",
} as const;

export type FishVoicesEnum =
  (typeof FishVoicesEnum)[keyof typeof FishVoicesEnum];

export const FishVoicesIDsEnum = {
  Eneas: "3ac673c5ea474038bed1b11f6dc95974",
  TobeyMaguire: "684ab9808dbe44ca94bd18e55347ad7f",
  WilliamBonner: "7d172aacf0154382a7cf02f6a540878d",
  WaldoMoraes: "ffbf65f4fb1e44c69ad9710bcd66f23c",
  Cava: "a8f1c1f18611478faa1ac163a84c939b",
  HomerSimpson: "515e8f2d5579421190ce61d32ff601eb",
  Sukuna: "1a72530654c44e44be0a008b33ebd583",
  JorgeIgor: "0c42955c25954d82a7eb09dc47c43164",
  Locutor: "572760b7d9ec4a369ca387dad720a828",
  Peninha: "248cf92cd8bb46bc8770f474dea810cf",
  GohanCrianca: "f8f4f6ebba814970998f60c7f78503f2",
  Goku: "dece2a4c7f8d476b8da3c3a6707298d4",
  LulaFlavioCosta: "a4ac1426e4a749839c86853ad613eebe",
  BolsonaroFlavioCosta: "ed827b0532324b12803bb9344a3a607f",
  Maurilio: "e2e3def0296840a682038098012aa20f",
  Vegeta: "ffc96f454fba40a7ab829f474d76b767",
  NarradorChris: "4b215a58407c4def88e0892def6421b2",
  DonaldTrump: "4d5fa13d58824062a669e37665626dba",
  CapitaoNascimento: "102bccca7dc64b6b8f8494c199c5d153",
  LulaFranciscoJunior: "ed7de8309b7f4643932df8f4b56ac988",
  CleberMachado: "8b0d9737fef5407f82812a64a851a6a4",
  Coringa: "fade11b01b5a4e43bb70e618c3e28662",
  BolsonaroBrunoVieira: "ebbfcf7d5e8f41d99bdcb80348bc0e5c",
  RickSanchez: "9318b32b5477496a960e2958dd51c7ea",
  RickSanchezPrimeiraTemporada: "bdb4986093f8403d8dad0858c0628aa1",
  PeterGriffin: "6a88fe5df52d49d3a063241edc9f32b9",
  MortyEn: "c57c01edfe2f440aade02b6b8477b141",
  MortySmith: "2acb7bbb60dc4fca92c00deaaae90de3",
  RickEn: "d66ff3b436674d9987b71743365ba79b",
  RickSanchezEn: "d2e75a3e3fd6419893057c02a375a113",
  PeterGriffinEn: "d75c270eaee14c8aa1e9e980cc37cf1b",
  MorganFreemanEn: "3ad4d432023c47ee9e6c7805b973630a",
  ElonEn: "2d68791e46f34687bd1231e2086ee925",
  MortalKombatEn: "d13f84b987ad4f22b56d2b47f4eb838e",
  IngloriousBsterdsEn: "b0fb196082c845d681975b5178711f72",
  AH64ApacheCPG2En: "74a39b3469894c34b0e4e560dec3a3ed",
  AH64ApacheCPGEn: "86170265b11a4d6187cabffcb9e87f8b",
  HomelanderEn: "a204d00fe33d4613bc7737a39323201c",
  Pateta: "ed7f998788b44fa59b680d92226480b7",
  CapitaoPatria: "9b3d632eeba6485d9f433139a675731b",
  MickeyMouse: "6bdf37402f6041b9bd3e2de6f6dc693c",
  ObitoJp: "00be8badfdf84dc0839353820d448726",
  MadaraJp: "6c67208e439b42158c887c79af30a20a",
  Pain1Jp: "dd9aaa6a4ec44055bb53ec6a615d1fc5",
  Pain2Jp: "edff2a83cfe94bfd8c9abc00499d705d",
  Primeagen: "06ba5b192f9a49f2942f72febea29fde",
  Guerrinha: "bfe77956a85f44a9be040ce16e87ecf0",
  Samir: "2a52afa29cd74ae5802ba7b516c929e7",
  BobEsponja: "0d604d0f2e834f7b82f97f6e81ec1bc5",
  Sasuke: "aedb06f6daa84a1db52c7479c7235910",
  Cartman: "ba6fb26d7d094e9888ac71c7dba651ee",
  Stewie: "26f644d9279841c5b41961991c9f9e06",
  ItoshiSae: "2bb270d0dc344007b53ae25cd00a4e85",
  SatoruGojo: "96a2c896ed7846848cdd83e484b23eb3",
  Anya: "ffe41701970d4b339ef7906300716f99",
  GalvaoBueno: "7fe10a00249247aabb495bae57ac80e1",
  NarutoJp: "fc30849cffd24f49824775fdeff53ff8",
  Obito2Jp: "01cf6bc227f54b6eace8eb2427b2642a",
} as const;

export type FishVoicesIDsEnum =
  (typeof FishVoicesIDsEnum)[keyof typeof FishVoicesIDsEnum];

export const fishVoices = {
  [FishVoicesEnum.Eneas]: {
    name: "Eneas",
    id: FishVoicesIDsEnum.Eneas,
  },
  [FishVoicesEnum.TobeyMaguire]: {
    name: "Tobey Maguire",
    id: FishVoicesIDsEnum.TobeyMaguire,
  },
  [FishVoicesEnum.WilliamBonner]: {
    name: "William Bonner",
    id: FishVoicesIDsEnum.WilliamBonner,
  },
  [FishVoicesEnum.WaldoMoraes]: {
    name: "Waldo Moraes",
    id: FishVoicesIDsEnum.WaldoMoraes,
  },
  [FishVoicesEnum.Cava]: {
    name: "Cava",
    id: FishVoicesIDsEnum.Cava,
  },
  [FishVoicesEnum.HomerSimpson]: {
    name: "Homer Simpson",
    id: FishVoicesIDsEnum.HomerSimpson,
  },
  [FishVoicesEnum.Sukuna]: {
    name: "Sukuna",
    id: FishVoicesIDsEnum.Sukuna,
  },
  [FishVoicesEnum.JorgeIgor]: {
    name: "Jorge Igor",
    id: FishVoicesIDsEnum.JorgeIgor,
  },
  [FishVoicesEnum.Locutor]: {
    name: "Locutor",
    id: FishVoicesIDsEnum.Locutor,
  },
  [FishVoicesEnum.Peninha]: {
    name: "Peninha",
    id: FishVoicesIDsEnum.Peninha,
  },
  [FishVoicesEnum.GohanCrianca]: {
    name: "Gohan Criança",
    id: FishVoicesIDsEnum.GohanCrianca,
  },
  [FishVoicesEnum.Goku]: {
    name: "Goku",
    id: FishVoicesIDsEnum.Goku,
  },
  [FishVoicesEnum.LulaFlavioCosta]: {
    name: "Lula 1",
    id: FishVoicesIDsEnum.LulaFlavioCosta,
  },
  [FishVoicesEnum.BolsonaroFlavioCosta]: {
    name: "Bolsonaro 1",
    id: FishVoicesIDsEnum.BolsonaroFlavioCosta,
  },
  [FishVoicesEnum.Maurilio]: {
    name: "Maurílio",
    id: FishVoicesIDsEnum.Maurilio,
  },
  [FishVoicesEnum.Vegeta]: {
    name: "Vegeta",
    id: FishVoicesIDsEnum.Vegeta,
  },
  [FishVoicesEnum.NarradorChris]: {
    name: "Todo Mundo Odeia o Chris",
    id: FishVoicesIDsEnum.NarradorChris,
  },
  [FishVoicesEnum.DonaldTrump]: {
    name: "Donald Trump (en)",
    id: FishVoicesIDsEnum.DonaldTrump,
  },
  [FishVoicesEnum.CapitaoNascimento]: {
    name: "Capitão Nascimento",
    id: FishVoicesIDsEnum.CapitaoNascimento,
  },
  [FishVoicesEnum.LulaFranciscoJunior]: {
    name: "Lula 2",
    id: FishVoicesIDsEnum.LulaFranciscoJunior,
  },
  [FishVoicesEnum.CleberMachado]: {
    name: "Cleber Machado",
    id: FishVoicesIDsEnum.CleberMachado,
  },
  [FishVoicesEnum.Coringa]: {
    name: "Coringa",
    id: FishVoicesIDsEnum.Coringa,
  },
  [FishVoicesEnum.BolsonaroBrunoVieira]: {
    name: "Bolsonaro 2",
    id: FishVoicesIDsEnum.BolsonaroBrunoVieira,
  },
  [FishVoicesEnum.RickSanchez]: {
    name: "Rick Sanchez",
    id: FishVoicesIDsEnum.RickSanchez,
  },
  [FishVoicesEnum.RickSanchezPrimeiraTemporada]: {
    name: "Rick Sanchez(1st season)",
    id: FishVoicesIDsEnum.RickSanchezPrimeiraTemporada,
  },
  [FishVoicesEnum.PeterGriffin]: {
    name: "Peter Griffin",
    id: FishVoicesIDsEnum.PeterGriffin,
  },
  [FishVoicesEnum.MortyEn]: {
    name: "Morty (en)",
    id: FishVoicesIDsEnum.MortyEn,
  },
  [FishVoicesEnum.MortySmith]: {
    name: "Morty Smith",
    id: FishVoicesIDsEnum.MortySmith,
  },
  [FishVoicesEnum.RickEn]: {
    name: "Rick (en)",
    id: FishVoicesIDsEnum.RickEn,
  },
  [FishVoicesEnum.RickSanchezEn]: {
    name: "Rick Sanchez (en)",
    id: FishVoicesIDsEnum.RickSanchezEn,
  },
  [FishVoicesEnum.PeterGriffinEn]: {
    name: "Peter Griffin (en)",
    id: FishVoicesIDsEnum.PeterGriffinEn,
  },
  [FishVoicesEnum.MorganFreemanEn]: {
    name: "Morgan Freeman (en)",
    id: FishVoicesIDsEnum.MorganFreemanEn,
  },
  [FishVoicesEnum.ElonEn]: {
    name: "Elon (en)",
    id: FishVoicesIDsEnum.ElonEn,
  },
  [FishVoicesEnum.MortalKombatEn]: {
    name: "Mortal Kombat (en)",
    id: FishVoicesIDsEnum.MortalKombatEn,
  },
  [FishVoicesEnum.IngloriousBsterdsEn]: {
    name: "Aldo Apache (en)",
    id: FishVoicesIDsEnum.IngloriousBsterdsEn,
  },
  [FishVoicesEnum.AH64ApacheCPG2En]: {
    name: "AH-64 Apache CPG 2 (en)",
    id: FishVoicesIDsEnum.AH64ApacheCPG2En,
  },
  [FishVoicesEnum.AH64ApacheCPGEn]: {
    name: "AH-64 Apache CPG (en)",
    id: FishVoicesIDsEnum.AH64ApacheCPGEn,
  },
  [FishVoicesEnum.HomelanderEn]: {
    name: "Homelander (en)",
    id: FishVoicesIDsEnum.HomelanderEn,
  },
  [FishVoicesEnum.Pateta]: {
    name: "Pateta",
    id: FishVoicesIDsEnum.Pateta,
  },
  [FishVoicesEnum.CapitaoPatria]: {
    name: "Capitão Pátria",
    id: FishVoicesIDsEnum.CapitaoPatria,
  },
  [FishVoicesEnum.MickeyMouse]: {
    name: "Mickey Mouse",
    id: FishVoicesIDsEnum.MickeyMouse,
  },
  [FishVoicesEnum.ObitoJp]: {
    name: "Obito 1 (jp)",
    id: FishVoicesIDsEnum.ObitoJp,
  },
  [FishVoicesEnum.MadaraJp]: {
    name: "Madara (jp)",
    id: FishVoicesIDsEnum.MadaraJp,
  },
  [FishVoicesEnum.Pain1Jp]: {
    name: "Pain (jp)",
    id: FishVoicesIDsEnum.Pain1Jp,
  },
  [FishVoicesEnum.Pain2Jp]: {
    name: "Pain 2 (jp)",
    id: FishVoicesIDsEnum.Pain2Jp,
  },
  [FishVoicesEnum.Primeagen]: {
    name: "Primeagen",
    id: FishVoicesIDsEnum.Primeagen,
  },
  [FishVoicesEnum.Guerrinha]: {
    name: "Guerrinha",
    id: FishVoicesIDsEnum.Guerrinha,
  },
  [FishVoicesEnum.Samir]: {
    name: "Samir",
    id: FishVoicesIDsEnum.Samir,
  },
  [FishVoicesEnum.BobEsponja]: {
    name: "Bob Esponja",
    id: FishVoicesIDsEnum.BobEsponja,
  },
  [FishVoicesEnum.Sasuke]: {
    name: "Sasuke",
    id: FishVoicesIDsEnum.Sasuke,
  },
  [FishVoicesEnum.Cartman]: {
    name: "Cartman",
    id: FishVoicesIDsEnum.Cartman,
  },
  [FishVoicesEnum.Stewie]: {
    name: "Stewie",
    id: FishVoicesIDsEnum.Stewie,
  },
  [FishVoicesEnum.ItoshiSae]: {
    name: "Itoshi Sae",
    id: FishVoicesIDsEnum.ItoshiSae,
  },
  [FishVoicesEnum.SatoruGojo]: {
    name: "Satoru Gojo",
    id: FishVoicesIDsEnum.SatoruGojo,
  },
  [FishVoicesEnum.Anya]: {
    name: "Anya",
    id: FishVoicesIDsEnum.Anya,
  },
  [FishVoicesEnum.GalvaoBueno]: {
    name: "Galvão Bueno",
    id: FishVoicesIDsEnum.GalvaoBueno,
  },
  [FishVoicesEnum.NarutoJp]: {
    name: "Naruto (jp)",
    id: FishVoicesIDsEnum.NarutoJp,
  },
  [FishVoicesEnum.Obito2Jp]: {
    name: "Obito 2 (jp)",
    id: FishVoicesIDsEnum.Obito2Jp,
  },
};

export const fishVoiceSlugSchema = z.nativeEnum(FishVoicesEnum);
