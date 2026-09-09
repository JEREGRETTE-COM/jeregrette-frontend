import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Quelles données jeregrette.com collecte, pourquoi, et tes droits.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-[26px] font-bold text-white">Politique de confidentialité</h1>
      <p className="text-muted text-[13px]">Dernière mise à jour : 9 septembre 2026</p>

      <p>
        Jeregrette.com repose sur le pseudonymat : ton nom d’utilisateur est public, ton
        adresse email ne l’est pas. Cette page dit exactement ce que nous conservons.
      </p>

      <h2>1. Données que nous collectons</h2>
      <p>Quand tu crées un compte :</p>
      <ul>
        <li>ton nom d’utilisateur, affiché publiquement sur chacune de tes publications ;</li>
        <li>ton adresse email, jamais affichée aux autres membres ;</li>
        <li>
          ton mot de passe, conservé sous forme chiffrée et irréversible. Personne, nous
          compris, ne peut le lire.
        </li>
      </ul>
      <p>Quand tu utilises le service :</p>
      <ul>
        <li>tes regrets, tes commentaires de republication et leur date ;</li>
        <li>tes réactions, et sur quelle publication ;</li>
        <li>
          des journaux techniques côté serveur : adresse IP, horodatage, pages demandées,
          conservés pour la sécurité et le diagnostic.
        </li>
      </ul>
      <p>
        Ta biographie et ton avatar sont facultatifs. Si tu les renseignes, ils sont
        publics.
      </p>

      <h2>2. Pourquoi</h2>
      <ul>
        <li>faire fonctionner le service et afficher le fil : exécution du contrat ;</li>
        <li>
          te reconnaître d’une visite à l’autre et sécuriser ton compte : exécution du
          contrat ;
        </li>
        <li>
          prévenir les abus, le spam et les tentatives d’intrusion : intérêt légitime ;
        </li>
        <li>répondre à une obligation légale quand elle s’applique.</li>
      </ul>
      <p>
        Nous ne faisons ni publicité, ni profilage, ni revente de données. Il n’y a aucun
        outil de mesure d’audience.
      </p>

      <h2>3. Cookies</h2>
      <p>
        Deux cookies seulement, tous deux nécessaires au fonctionnement. Ils ne servent pas
        au suivi et ne sont lisibles que par le serveur, jamais par un script de la page.
      </p>
      <ul>
        <li>
          un cookie de session, dont la durée est celle de ton jeton de connexion ;
        </li>
        <li>
          un cookie de renouvellement, valable 30 jours, qui t’évite de te reconnecter à
          chaque visite.
        </li>
      </ul>
      <p>Te déconnecter les supprime immédiatement.</p>

      <h2>4. Qui d’autre voit ces données</h2>
      <p>
        Nous ne vendons ni ne partageons tes données. Deux prestataires techniques les
        traitent pour notre compte, sur leurs serveurs :
      </p>
      <ul>
        <li>Vercel, qui héberge le site ;</li>
        <li>Railway, qui héberge l’API et la base de données.</li>
      </ul>
      <p>
        Ces prestataires peuvent opérer en dehors de l’Union européenne. Le cas échéant, les
        transferts s’appuient sur les clauses contractuelles types de la Commission
        européenne.
      </p>

      <h2>5. Ce qui est public</h2>
      <p>
        Tes regrets, tes republications, tes réactions et ton nom d’utilisateur sont
        visibles par les autres membres. Un regret peut être republié et partagé sous forme
        d’image en dehors du service. Une fois partagée, cette image ne peut plus être
        rappelée, même si tu supprimes la publication d’origine.
      </p>

      <h2>6. Durée de conservation</h2>
      <ul>
        <li>compte et publications : tant que le compte existe ;</li>
        <li>après suppression du compte : effacement sous 30 jours ;</li>
        <li>journaux techniques : 12 mois au plus.</li>
      </ul>

      <h2>7. Tes droits</h2>
      <p>
        Tu peux demander l’accès à tes données, leur rectification, leur effacement, la
        limitation ou l’opposition à leur traitement, et leur portabilité.
      </p>
      <p>
        Tu peux modifier ton nom d’utilisateur et ta biographie depuis ton profil, et
        supprimer tes publications une par une. La suppression du compte n’est pas encore
        automatisée : écris à{" "}
        <a href="mailto:contact@jeregrette.com">contact@jeregrette.com</a>, la demande est
        traitée manuellement sous 30 jours.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Les échanges passent par HTTPS. Les mots de passe sont chiffrés de façon
        irréversible. Les jetons de connexion sont conservés dans des cookies inaccessibles
        aux scripts de la page. Aucun système n’est infaillible : en cas de violation de
        données affectant tes droits, tu seras informé.
      </p>

      <h2>9. Mineurs</h2>
      <p>
        Le service n’est pas destiné aux moins de 15 ans. Si nous apprenons qu’un compte
        appartient à un enfant plus jeune, il sera supprimé.
      </p>

      <h2>10. Modifications</h2>
      <p>
        Cette politique peut évoluer. La date en haut de page indique la version en vigueur.
        Un changement important sera signalé dans l’application.
      </p>

      <h2>11. Contact</h2>
      <p>
        Pour toute question ou pour exercer tes droits :{" "}
        <a href="mailto:contact@jeregrette.com">contact@jeregrette.com</a>.
      </p>

      <p className="mt-10">
        Voir aussi le <Link href="/contrat-utilisation">contrat d’utilisation</Link>.
      </p>
    </>
  );
}
