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

// Checklist de formalités belges — À VÉRIFIER avec des sources officielles
// (SPF Intérieur, commune, notaire.be) avant toute mise en production.
// Voir docs/product.md, section "Vérification des formalités belges".
const BELGIAN_DEFAULT_CHECKLIST = [
  { title: 'Faire constater le décès par un médecin', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.URGENT, category: null },
  { title: 'Obtenir le certificat médical de décès', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.URGENT, category: 'health' },
  { title: 'Déclarer le décès à la commune', responsible: ResponsibleType.FUNERAL_HOME, priority: ChecklistTaskPriority.URGENT, category: 'identity' },
  { title: "Obtenir l'acte de décès", responsible: ResponsibleType.FUNERAL_HOME, priority: ChecklistTaskPriority.HIGH, category: 'identity' },
  { title: "Organiser l'inhumation ou la crémation", responsible: ResponsibleType.FUNERAL_HOME, priority: ChecklistTaskPriority.HIGH, category: 'ceremony' },
  { title: 'Prévenir la banque', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.HIGH, category: 'bank' },
  { title: 'Prévenir la mutuelle', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'health' },
  { title: 'Prévenir les compagnies d’assurance', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'insurance' },
  { title: "Prévenir l'employeur", responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'work' },
  { title: 'Contacter un notaire pour la succession', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'succession' },
  { title: 'Vérifier les droits à pension', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'succession' },
  { title: 'Déclarer aux impôts', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'taxes' },
  { title: 'Gérer les abonnements et comptes en ligne', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.LOW, category: 'other' },
  { title: 'Gérer le logement', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'housing' },
  { title: 'Gérer les véhicules', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.LOW, category: 'vehicles' },
  { title: 'Prendre soin des animaux du défunt', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.HIGH, category: 'pets' },
  { title: 'Gérer les réseaux sociaux du défunt', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.LOW, category: 'other' },
  { title: 'Rassembler les documents de succession', responsible: ResponsibleType.FAMILY, priority: ChecklistTaskPriority.NORMAL, category: 'succession' },
];

async function main() {
  console.log('Seed Legacy — démarrage');

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
        "Formalités usuelles suite à un décès en Belgique. À vérifier avec des sources officielles avant production.",
      isDefault: true,
      items: {
        create: BELGIAN_DEFAULT_CHECKLIST.map((item, index) => ({
          title: item.title,
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
