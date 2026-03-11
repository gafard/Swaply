import { TERMS_VERSION } from "@/lib/legal";

export const termsDocument = {
  version: TERMS_VERSION,
  updatedAtLabel: "11 mars 2026",
  title: "Conditions d'utilisation de Swaply",
  intro:
    "Swaply est une plateforme de découverte, de réservation et d'échange d'objets entre particuliers. En créant un compte ou en utilisant l'application, vous acceptez les conditions ci-dessous.",
  sections: [
    {
      title: "1. Objet du service",
      paragraphs: [
        "Swaply permet aux utilisateurs de publier des objets, de proposer des échanges, d'utiliser des crédits internes appelés Swaps et d'organiser des rencontres dans leur marché local.",
        "Swaply fournit l'infrastructure technique. La plateforme n'est pas propriétaire des objets publiés et n'est pas partie aux échanges conclus entre utilisateurs.",
      ],
    },
    {
      title: "2. Conditions d'accès",
      paragraphs: [
        "Vous devez fournir des informations exactes lors de la création de votre compte et garder vos accès confidentiels.",
        "Vous êtes responsable de toute activité réalisée depuis votre compte jusqu'à sa fermeture ou la révocation de votre session.",
      ],
    },
    {
      title: "3. Règles de publication",
      paragraphs: [
        "Vous ne devez publier que des objets que vous possédez réellement ou que vous êtes autorisé à échanger.",
        "Les annonces mensongères, trompeuses, dupliquées, volées, contrefaites, interdites par la loi ou contraires à la sécurité des utilisateurs sont interdites.",
        "Les photos, descriptions, prix en Swaps et états déclarés doivent correspondre à la réalité de l'objet proposé.",
      ],
    },
    {
      title: "4. Utilisation des Swaps",
      paragraphs: [
        "Les Swaps sont des crédits internes à la plateforme. Ils ne constituent pas une monnaie électronique ni un dépôt bancaire.",
        "Les Swaps peuvent être utilisés uniquement dans les cas prévus par l'application: échanges, options de visibilité, packages de recharge ou services internes proposés par Swaply.",
        "Sauf mention expresse de la plateforme, les Swaps ne sont ni transférables librement entre utilisateurs, ni remboursables en espèces.",
      ],
    },
    {
      title: "5. Réservations, rencontres et échanges",
      paragraphs: [
        "Les utilisateurs restent seuls responsables de la préparation, de la vérification et de l'exécution de leurs échanges.",
        "Vous devez vérifier l'état réel de l'objet avant de confirmer l'échange et utiliser les points de rencontre recommandés lorsqu'ils sont proposés.",
        "Swaply peut enregistrer des preuves techniques, validations QR, messages ou signaux d'activité afin de sécuriser les échanges et traiter les litiges.",
      ],
    },
    {
      title: "6. Paiements et recharges",
      paragraphs: [
        "Lorsque des recharges ou paiements sont proposés, ils sont traités via des prestataires tiers. Des conditions supplémentaires propres à ces prestataires peuvent s'appliquer.",
        "Vous êtes responsable de la conformité des moyens de paiement utilisés et de l'exactitude des informations transmises lors d'une recharge.",
      ],
    },
    {
      title: "7. Modération et sanctions",
      paragraphs: [
        "Swaply peut suspendre, limiter, masquer ou supprimer un contenu, un échange ou un compte en cas de soupçon de fraude, de non-respect des règles, de comportement abusif ou de risque pour la communauté.",
        "Les bonus, crédits promotionnels ou avantages accordés peuvent être annulés en cas d'usage abusif ou frauduleux.",
      ],
    },
    {
      title: "8. Responsabilité",
      paragraphs: [
        "Swaply met en œuvre des moyens raisonnables pour fournir un service disponible et sécurisé, sans garantir une disponibilité continue, l'absence totale d'erreurs ou le succès de chaque échange.",
        "Dans les limites autorisées par la loi applicable, Swaply ne pourra pas être tenu responsable des pertes résultant d'un échange entre utilisateurs, d'informations trompeuses publiées par un tiers, d'une indisponibilité temporaire du service ou d'un usage non conforme du compte.",
      ],
    },
    {
      title: "9. Données et confidentialité",
      paragraphs: [
        "Swaply traite des données techniques, de compte, de localisation et d'activité nécessaires au fonctionnement, à la sécurité et à la personnalisation du service.",
        "Certaines données peuvent être partagées avec des sous-traitants techniques indispensables à l'hébergement, à l'authentification, au stockage, aux paiements ou aux notifications.",
      ],
    },
    {
      title: "10. Propriété intellectuelle",
      paragraphs: [
        "Les éléments propres à Swaply, y compris la marque, l'interface, les visuels, les textes, le code et les composants originaux, restent protégés par les droits de propriété intellectuelle applicables.",
        "Vous conservez vos droits sur les contenus que vous publiez, mais vous accordez à Swaply une autorisation d'hébergement, d'affichage et d'utilisation technique nécessaire au fonctionnement du service.",
      ],
    },
    {
      title: "11. Évolution des conditions",
      paragraphs: [
        "Swaply peut mettre à jour les présentes conditions pour tenir compte d'évolutions légales, techniques ou produit.",
        "La version applicable est celle acceptée lors de votre création de compte ou lors de votre dernière réacceptation demandée par la plateforme.",
      ],
    },
    {
      title: "12. Contact",
      paragraphs: [
        "Pour toute question relative à ces conditions, à la sécurité de la plateforme ou à un signalement, vous pouvez contacter l'équipe Swaply via les canaux de support disponibles dans l'application.",
      ],
    },
  ],
} as const;
