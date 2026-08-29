import type { FeedItem, Regret } from "@/types";

const welcomeRegret: Regret = {
  id: "welcome",
  author: {
    handle: "@terrifiedofwoman457",
    avatar: "/avatars/terrifiedofwoman457.png",
  },
  time: "15 min",
  text: "Hello, bienvenue sur jeregrette.com 🤣🤭 💀",
  background: "#383861",
  counts: { skull: 36, laugh: 70, cry: 50 },
  reacted: "skull",
  reposts: 77,
};

export const feed: FeedItem[] = [
  {
    kind: "regret",
    regret: {
      id: "rhdp",
      author: { handle: "@adjamela3", avatar: "/avatars/adjamela3.png" },
      time: "1 min",
      text: "Je regrette d’être entré au RHDP 😭💔🇨🇮",
      background: "#a20c37",
      counts: { skull: 42, laugh: 88, cry: 31 },
      reacted: "laugh",
      reposts: 92,
    },
  },
  {
    kind: "regret",
    regret: {
      id: "jamais",
      author: { handle: "@grandpapa", avatar: "/avatars/grandpapa.png" },
      time: "1 min",
      text: "Je peux pas donner derrière !\nJAMAIS !!! 😤😤😤",
      background: "#9da20c",
      counts: { skull: 42, laugh: 88, cry: 31 },
      reacted: "laugh",
      reposts: 92,
    },
  },
  {
    kind: "regret",
    regret: {
      id: "entreprise",
      author: { handle: "@aquilafaute", avatar: "/avatars/aquilafaute.png" },
      time: "3 min",
      text: "Je regrette d’être dans cette entreprise deh, att djai est fini dans votre caisse oub ? payez l’homme tchai 🚶🏾‍♂️💀",
      background: "#950ca2",
      counts: { skull: 42, laugh: 88, cry: 31 },
      reacted: "laugh",
      reposts: 92,
    },
  },
  {
    kind: "repost",
    repost: {
      id: "mogo",
      author: { handle: "@fucklesmogodeb", avatar: "/avatars/fucklesmogodeb.png" },
      time: "8 min",
      comment: "Ouais les môgô sont tellement bons🤣🤣🤣🤣",
      counts: { skull: 12, laugh: 4, cry: 22 },
      reacted: "cry",
      reposts: 48,
      regret: welcomeRegret,
    },
  },
  { kind: "regret", regret: welcomeRegret },
];
