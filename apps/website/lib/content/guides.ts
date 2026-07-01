export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  requiresOfficialVerification?: boolean;
}

/**
 * Contenu éditorial de départ. Les articles concernant les formalités
 * belges (marqués `requiresOfficialVerification`) DOIVENT être vérifiés
 * avec des sources officielles (SPF Intérieur, commune, notaire.be) avant
 * toute mise en production — voir docs/product.md.
 */
export const GUIDES: Guide[] = [
  {
    slug: 'que-faire-apres-un-deces-en-belgique',
    title: 'Que faire après un décès en Belgique ?',
    excerpt: "Les premières démarches, dans l'ordre, pour ne rien oublier dans les jours qui suivent.",
    requiresOfficialVerification: true,
    content: [
      "Faire constater le décès par un médecin, puis obtenir le certificat médical de décès.",
      "Déclarer le décès à la commune du lieu de décès, généralement via la pompe funèbre.",
      "Organiser l'inhumation ou la crémation avec l'entreprise de pompes funèbres.",
      "Prévenir progressivement la banque, la mutuelle, les assurances et l'employeur.",
      "Contacter un notaire pour la succession si nécessaire.",
    ],
  },
  {
    slug: 'quels-documents-preparer-pour-ses-proches',
    title: 'Quels documents préparer pour ses proches ?',
    excerpt: 'Une liste simple des documents qui font gagner un temps précieux à votre famille.',
    content: [
      "Carte d'identité, livret de famille, contrats d'assurance, relevés bancaires.",
      'Titre de propriété ou bail, carte grise des véhicules, contrats en cours (énergie, télécom).',
      'Coordonnées du notaire, du médecin traitant, de l’employeur.',
      'Rassembler ces documents dans un même espace, physique ou numérique, évite bien des recherches.',
    ],
  },
  {
    slug: 'comment-organiser-ses-volontes-de-son-vivant',
    title: 'Comment organiser ses volontés de son vivant ?',
    excerpt: 'Cérémonie, musiques, messages aux proches : exprimer ses souhaits sans démarche légale.',
    content: [
      "Vos volontés (inhumation ou crémation, type de cérémonie, musiques, textes) ne remplacent pas un testament légal.",
      "Elles aident vos proches à prendre des décisions en accord avec ce que vous auriez souhaité.",
      'Vous pouvez les modifier à tout moment, et les partager avec une ou plusieurs personnes de confiance.',
    ],
  },
  {
    slug: 'comment-aider-une-famille-apres-un-deces',
    title: 'Comment aider une famille après un décès ?',
    excerpt: "Des gestes concrets pour soutenir un proche endeuillé dans les démarches administratives.",
    content: [
      'Proposer une aide concrète (appeler une administration, accompagner à un rendez-vous) plutôt que générale.',
      "Aider à identifier les documents et informations déjà disponibles avant de chercher ailleurs.",
      "Respecter le rythme de la personne endeuillée : certaines démarches peuvent attendre.",
    ],
  },
  {
    slug: 'pourquoi-les-pompes-funebres-devraient-proposer-un-accompagnement-numerique',
    title: 'Pourquoi les pompes funèbres devraient proposer un accompagnement numérique ?',
    excerpt: 'Moderniser sans déshumaniser : un outil numérique au service de la relation client.',
    content: [
      'Un portail numérique permet de centraliser les documents et de réduire les allers-retours papier.',
      "Les familles gagnent en clarté sur l'avancement des démarches, ce qui réduit leur charge mentale.",
      'La relation humaine reste centrale : le numérique vient en soutien, jamais en remplacement.',
    ],
  },
  {
    slug: 'comment-preparer-un-dossier-personnel-pour-soulager-ses-proches',
    title: 'Comment préparer un dossier personnel pour soulager ses proches ?',
    excerpt: 'Un guide pas à pas pour démarrer votre dossier vivant sans vous sentir dépassé·e.',
    content: [
      "Commencez petit : vos contacts importants, puis vos documents essentiels.",
      "Ajoutez vos volontés et désignez une personne de confiance quand vous vous sentez prêt·e.",
      "Le dossier peut être complété progressivement — il n'y a pas d'ordre obligatoire.",
    ],
  },
  {
    slug: 'quelles-informations-transmettre-a-sa-famille',
    title: 'Quelles informations transmettre à sa famille ?',
    excerpt: 'Un tour d’horizon des informations vraiment utiles, sans surcharge inutile.',
    content: [
      'Coordonnées des contacts clés (médecin, notaire, banque), localisation des documents importants.',
      'Vos volontés pour la cérémonie et vos souhaits pour vos animaux si vous en avez.',
      'Une vue d’ensemble de vos abonnements et comptes en ligne, avec vos consignes (fermer, conserver, transférer).',
    ],
  },
  {
    slug: 'comment-choisir-une-personne-de-confiance',
    title: 'Comment choisir une personne de confiance ?',
    excerpt: 'Les critères pour désigner la ou les bonnes personnes.',
    content: [
      'Une personne de confiance doit être disponible, fiable, et à l’aise avec les démarches administratives.',
      'Vous pouvez désigner plusieurs personnes de confiance et leur accorder des niveaux d’accès différents.',
      'Ce choix peut être révisé à tout moment depuis votre espace personnel.',
    ],
  },
  {
    slug: 'documents-a-retrouver-rapidement-apres-un-deces',
    title: "Quels documents une famille doit-elle retrouver rapidement après un décès ?",
    excerpt: "Les documents les plus urgents à rassembler dans les tout premiers jours.",
    requiresOfficialVerification: true,
    content: [
      "Carte d'identité du défunt et livret de famille.",
      'Certificat médical de décès, puis acte de décès délivré par la commune.',
      "Contrats d'assurance obsèques ou de prévoyance funéraire, s'ils existent.",
      'Coordonnées de la banque et du notaire pour entamer les démarches de succession.',
    ],
  },
  {
    slug: 'preparer-ses-informations-sans-creer-un-testament',
    title: 'Comment préparer ses informations sans créer un testament ?',
    excerpt: 'La différence entre organiser ses informations et rédiger un testament légal.',
    content: [
      "Un testament est un acte légal qui organise la transmission de patrimoine — il nécessite un notaire.",
      'Legacy vous permet d’organiser des informations pratiques (documents, contacts, volontés) qui facilitent la vie de vos proches, sans valeur légale.',
      'Les deux démarches sont complémentaires : Legacy ne remplace jamais un testament ou un acte notarié.',
    ],
  },
];
