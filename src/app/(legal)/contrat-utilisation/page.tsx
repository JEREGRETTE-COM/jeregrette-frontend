import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contrat d’utilisation",
  description: "Les règles d’utilisation de jeregrette.com.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-[26px] font-bold text-white">Contrat d’utilisation</h1>
      <p className="text-muted text-[13px]">Dernière mise à jour : 9 septembre 2026</p>

      <h2>1. Objet</h2>
      <p>
        Jeregrette.com est un service qui permet de publier des regrets sous un pseudonyme,
        de réagir à ceux des autres et de les republier. En créant un compte, tu acceptes le
        présent contrat. Si tu n’es pas d’accord, n’utilise pas le service.
      </p>

      <h2>2. Compte</h2>
      <p>
        Il faut avoir au moins 15 ans pour créer un compte. La création demande un nom
        d’utilisateur, une adresse email et un mot de passe d’au moins 8 caractères.
      </p>
      <ul>
        <li>
          Tu es responsable de ton mot de passe et de tout ce qui est publié depuis ton
          compte.
        </li>
        <li>Un seul compte par personne. Usurper l’identité de quelqu’un est interdit.</li>
        <li>
          Ton nom d’utilisateur est public. Ne le choisis pas s’il révèle ton identité
          réelle et que tu ne le souhaites pas.
        </li>
      </ul>

      <h2>3. Tes publications</h2>
      <p>
        Tu restes propriétaire de ce que tu publies. En publiant, tu accordes à
        jeregrette.com le droit d’afficher ton regret dans le fil, de le rendre accessible
        aux autres membres, et de le rendre sous forme d’image lorsqu’il est partagé. Ce
        droit s’arrête quand tu supprimes la publication, sous réserve des copies déjà
        faites par d’autres.
      </p>
      <p>
        Un regret est limité à 500 caractères. Tu es seul responsable de son contenu.
      </p>

      <h2>4. Ce qui est interdit</h2>
      <p>Il est interdit de publier ou de republier :</p>
      <ul>
        <li>des propos haineux, racistes, sexistes, homophobes ou incitant à la violence ;</li>
        <li>du harcèlement, des menaces, ou l’identification d’une personne sans son accord ;</li>
        <li>
          des informations privées concernant un tiers : nom complet, adresse, numéro de
          téléphone, lieu de travail, photos prises à son insu ;
        </li>
        <li>tout contenu sexuel impliquant des mineurs, sans aucune exception ;</li>
        <li>du contenu illégal, diffamatoire, ou violant les droits d’un tiers ;</li>
        <li>du spam, de la publicité, ou l’automatisation de publications.</li>
      </ul>
      <p>
        Écrire un regret sur une personne réelle en la rendant reconnaissable relève du
        harcèlement, même sous forme d’humour.
      </p>

      <h2>5. Modération</h2>
      <p>
        Nous pouvons supprimer toute publication et suspendre tout compte qui enfreint ces
        règles, sans préavis. La modération est aujourd’hui manuelle : il n’existe pas
        encore de signalement dans l’application. En attendant, écris à{" "}
        <a href="mailto:contact@jeregrette.com">contact@jeregrette.com</a> pour signaler un
        contenu.
      </p>

      <h2>6. Republication et partage</h2>
      <p>
        Tout regret publié peut être republié par un autre membre, avec ou sans commentaire,
        et partagé sous forme d’image en dehors de la plateforme. Une image partagée échappe
        à notre contrôle : elle peut continuer de circuler après la suppression du regret
        d’origine. Publie en conséquence.
      </p>

      <h2>7. Disponibilité du service</h2>
      <p>
        Le service est en développement actif. Il peut être interrompu, modifié ou
        réinitialisé sans préavis. Nous ne garantissons ni la disponibilité, ni la
        conservation durable de tes publications. Ne l’utilise pas comme archive.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        Le service est fourni en l’état. Nous ne sommes pas responsables des contenus
        publiés par les membres, ni des dommages résultant de l’utilisation du service, dans
        les limites permises par la loi.
      </p>

      <h2>9. Résiliation</h2>
      <p>
        Tu peux cesser d’utiliser le service à tout moment. La suppression du compte n’est
        pas encore automatisée : demande-la à{" "}
        <a href="mailto:contact@jeregrette.com">contact@jeregrette.com</a> et elle sera
        traitée manuellement.
      </p>

      <h2>10. Modifications</h2>
      <p>
        Ce contrat peut évoluer. En cas de changement important, les membres seront prévenus
        dans l’application. La date en haut de page indique la dernière version.
      </p>

      <h2>11. Droit applicable</h2>
      <p>
        Le présent contrat est soumis au droit ivoirien. Tout litige relève des tribunaux
        compétents d’Abidjan.
      </p>

      <p className="mt-10">
        Voir aussi la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </>
  );
}
