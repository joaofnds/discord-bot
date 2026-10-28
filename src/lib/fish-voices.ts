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
    name: "Donald Trump",
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
};

export const fishVoiceSlugSchema = z.nativeEnum(FishVoicesEnum);
