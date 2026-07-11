import { PrismaClient, ResponsibleType, ChecklistTaskPriority, UserRole, MemberStatus } from '@prisma/client';

const prisma = new PrismaClient();

const DOCUMENT_CATEGORIES = [
  { key: 'identity', label: 'Identité' },
  { key: 'health', label: 'Santé' },
  { key: 'insurance', label: 'Assurance' },
  { key: 'bank', label: 'Banque' },
  { key: 'housing', label: 'Logement' },
  { key: 'succession', label: 'Succession' },
  { key: 'ceremony', label: 'Cérémonie' },
  { key: 'family', label: 'Famille' },
  { key: 'pets', label: 'Animaux' },
  { key: 'vehicles', label: 'Véhicules' },
  { key: 'work', label: 'Travail' },
  { key: 'taxes', label: 'Fiscalité' },
  { key: 'other', label: 'Autres' },
];

// Checklist de formalités belges.
// Vérifiée le 2026-07-11 sur les portails officiels : belgium.be (Famille >
// Décès), notaire.be (Procédure après décès / Déclaration de succession) et
// SPF Finances (finances.belgium.be > Décès). Les descriptions rappellent
// l'autorité compétente et les délais légaux. Ces délais s'entendent pour un
// décès survenu en Belgique ; les pompes funèbres doivent confirmer les
// variantes communales. Voir docs/product.md, section « Formalités belges ».
const BELGIAN_DEFAULT_CHECKLIST = [
  {
    title: 'Faire constater le décès par un médecin',
    description:
      "Un médecin constate le décès et remplit le certificat de décès (modèle IIIC/IIID). Indispensable à toute suite. Source : belgium.be (Famille > Décès).",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.URGENT,
    category: null,
  },
  {
    title: 'Obtenir le certificat médical de décès',
    description:
      "Le certificat médical de décès est remis par le médecin ; il conditionne la déclaration à la commune et l'organisation des obsèques.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.URGENT,
    category: 'health',
  },
  {
    title: 'Déclarer le décès à la commune',
    description:
      "À déclarer au plus vite au service État civil de la commune du lieu du décès. En pratique, l'entrepreneur de pompes funèbres s'en charge. Source : belgium.be (Famille > Décès > Déclaration).",
    responsible: ResponsibleType.FUNERAL_HOME,
    priority: ChecklistTaskPriority.URGENT,
    category: 'identity',
  },
  {
    title: "Obtenir l'acte de décès",
    description:
      "L'acte de décès est dressé par la commune du lieu du décès, puis transmis à la commune de résidence. Demandez plusieurs extraits (banques, assurances, notaire).",
    responsible: ResponsibleType.FUNERAL_HOME,
    priority: ChecklistTaskPriority.HIGH,
    category: 'identity',
  },
  {
    title: "Organiser l'inhumation ou la crémation",
    description:
      "Selon les volontés du défunt et l'autorisation communale d'inhumer/incinérer. À coordonner avec la commune et la pompe funèbre.",
    responsible: ResponsibleType.FUNERAL_HOME,
    priority: ChecklistTaskPriority.HIGH,
    category: 'ceremony',
  },
  {
    title: 'Prévenir la banque',
    description:
      "Les comptes du défunt (et souvent les comptes joints) sont bloqués dès la notification du décès, dans l'attente de la dévolution successorale. Prévenir rapidement avec un acte de décès.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.HIGH,
    category: 'bank',
  },
  {
    title: 'Prévenir la mutuelle',
    description:
      "La mutualité clôture les droits et peut intervenir dans certains frais (indemnité, allocation). Fournir l'acte de décès.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.NORMAL,
    category: 'health',
  },
  {
    title: "Prévenir les compagnies d'assurance",
    description:
      "Assurances-vie, obsèques, solde restant dû, habitation, auto : déclarer le décès pour activer les garanties ou résilier/transférer les contrats.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.NORMAL,
    category: 'insurance',
  },
  {
    title: "Prévenir l'employeur ou l'organisme de paiement",
    description:
      "Employeur (si en activité) ou service des pensions / caisse d'allocations : arrêt des paiements, solde de tout compte, pension de survie éventuelle.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.NORMAL,
    category: 'work',
  },
  {
    title: 'Contacter un notaire pour la succession',
    description:
      "Le notaire établit l'acte ou le certificat d'hérédité (nécessaire au déblocage des avoirs) et accompagne la déclaration de succession. Source : notaire.be (Procédure après décès).",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.NORMAL,
    category: 'succession',
  },
  {
    title: 'Vérifier les droits à pension et de survie',
    description:
      "Vérifier auprès du Service fédéral des Pensions les droits éventuels du conjoint/cohabitant survivant (pension de survie, allocation de transition).",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.NORMAL,
    category: 'succession',
  },
  {
    title: 'Déposer la déclaration de succession',
    description:
      "Délai : 4 mois pour un décès en Belgique, 5 mois si dans un autre pays d'Europe, 6 mois hors Europe. Le paiement des droits de succession est dû dans les 6 mois (décès en Belgique). Un retard entraîne une majoration. Source : SPF Finances (finances.belgium.be) et notaire.be.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.HIGH,
    category: 'taxes',
  },
  {
    title: 'Gérer les abonnements et comptes en ligne',
    description:
      "Énergie, télécom, streaming, cloud : résilier, transférer ou clôturer. Utiliser la liste d'abonnements du dossier vivant si elle existe.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.LOW,
    category: 'other',
  },
  {
    title: 'Gérer le logement',
    description:
      "Bail (résiliation/transfert) ou bien en propriété (succession) ; prévenir le propriétaire ou le syndic, adapter les contrats liés (énergie, assurance habitation).",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.NORMAL,
    category: 'housing',
  },
  {
    title: 'Gérer les véhicules',
    description:
      "Radiation ou transfert de l'immatriculation (DIV), adaptation de l'assurance auto, éventuelle revente dans le cadre de la succession.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.LOW,
    category: 'vehicles',
  },
  {
    title: 'Prendre soin des animaux du défunt',
    description:
      "Assurer immédiatement la garde et les soins des animaux ; mettre à jour l'identification (registre) vers le nouveau détenteur.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.HIGH,
    category: 'pets',
  },
  {
    title: 'Gérer les réseaux sociaux et l\'identité numérique',
    description:
      "Mise en mémoire ou suppression des comptes (Facebook, Instagram, Google…) selon les procédures de chaque plateforme et les volontés exprimées.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.LOW,
    category: 'other',
  },
  {
    title: 'Rassembler les documents de succession',
    description:
      "Réunir actes, relevés bancaires, contrats d'assurance, titres de propriété et dettes pour le notaire et la déclaration de succession.",
    responsible: ResponsibleType.FAMILY,
    priority: ChecklistTaskPriority.NORMAL,
    category: 'succession',
  },
];

// Catalogue de permissions fines (aligné sur packages/shared/src/constants/
// permissions.ts) : les rôles personnalisés d'une organisation s'appuient
// dessus, en complément des 7 rôles plateforme de base.
const PERMISSION_CATALOG: { key: string; description: string }[] = [
  { key: 'death_case.read', description: "Consulter les dossiers décès" },
  { key: 'death_case.write', description: "Créer et modifier les dossiers décès" },
  { key: 'death_case.archive', description: "Archiver un dossier décès" },
  { key: 'document.read', description: "Consulter les documents" },
  { key: 'document.download', description: "Télécharger les documents" },
  { key: 'document.delete', description: "Supprimer un document" },
  { key: 'checklist_template.manage', description: "Gérer les modèles de checklist" },
  { key: 'organization.members.manage', description: "Gérer les collaborateurs de l'organisation" },
  { key: 'organization.settings.manage', description: "Gérer les paramètres de l'organisation" },
  { key: 'family.invite', description: "Inviter des proches sur un dossier" },
  { key: 'audit_log.read', description: "Consulter le journal d'audit" },
  { key: 'export.create', description: "Générer des exports (PDF, ZIP, RGPD)" },
];

async function main() {
  console.log('Seed Legacy — démarrage');

  // Catalogue de permissions (idempotent).
  await Promise.all(
    PERMISSION_CATALOG.map((p) =>
      prisma.permission.upsert({ where: { key: p.key }, update: { description: p.description }, create: p }),
    ),
  );

  const categories = await Promise.all(
    DOCUMENT_CATEGORIES.map((c) =>
      prisma.documentCategory.upsert({ where: { key: c.key }, update: {}, create: c }),
    ),
  );
  const categoryByKey = Object.fromEntries(categories.map((c) => [c.key, c]));

  const organization = await prisma.organization.upsert({
    where: { id: 'seed-org-funeraire-exemple' },
    update: {},
    create: {
      id: 'seed-org-funeraire-exemple',
      name: 'Pompes Funèbres Exemple',
      primaryColor: '#0B1E3D',
      secondaryColor: '#7C9885',
      address: 'Rue de la Paix 12, 1000 Bruxelles',
      phone: '+32 2 000 00 00',
      email: 'contact@pf-exemple.be',
    },
  });

  const template = await prisma.checklistTemplate.upsert({
    where: { id: 'seed-template-belgique-defaut' },
    update: {},
    create: {
      id: 'seed-template-belgique-defaut',
      organizationId: organization.id,
      name: 'Checklist belge par défaut',
      description:
        "Formalités usuelles suite à un décès en Belgique. Vérifiée le 2026-07-11 sur belgium.be, notaire.be et le SPF Finances. Les délais s'entendent pour un décès survenu en Belgique ; confirmer les variantes communales.",
      isDefault: true,
      items: {
        create: BELGIAN_DEFAULT_CHECKLIST.map((item, index) => ({
          title: item.title,
          description: item.description,
          responsible: item.responsible,
          defaultPriority: item.priority,
          order: index,
          requiredDocumentCategoryId: item.category ? categoryByKey[item.category]?.id : null,
        })),
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@legacy.local' },
    update: {},
    create: {
      email: 'admin@legacy.local',
      keycloakId: 'seed-keycloak-admin',
      firstName: 'Super',
      lastName: 'Admin',
      memberships: {
        create: {
          organizationId: organization.id,
          baseRole: UserRole.FUNERAL_HOME_ADMIN,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      },
    },
  });

  const livingUser = await prisma.user.upsert({
    where: { email: 'vivant@legacy.local' },
    update: {},
    create: {
      email: 'vivant@legacy.local',
      keycloakId: 'seed-keycloak-living-user',
      firstName: 'Jeanne',
      lastName: 'Exemple',
      livingProfile: {
        create: {
          status: 'IN_PROGRESS',
          progressPercent: 40,
          contacts: {
            create: [
              {
                category: 'FAMILY',
                firstName: 'Paul',
                lastName: 'Exemple',
                relationship: 'Fils',
                phone: '+32 470 00 00 00',
                priority: 'HIGH',
                visibleToFamily: true,
              },
            ],
          },
          wishes: {
            create: [
              {
                category: 'BURIAL_OR_CREMATION',
                title: 'Crémation ou inhumation',
                content: 'Je souhaite une crémation, sans cérémonie religieuse.',
              },
            ],
          },
        },
      },
    },
  });

  console.log('Seed terminé :', {
    organization: organization.name,
    checklistTemplate: template.name,
    users: [admin.email, livingUser.email],
    documentCategories: categories.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
