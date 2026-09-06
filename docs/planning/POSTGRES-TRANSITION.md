# Passage SQLite → PostgreSQL — procédure de réalisation sans code

Référence : [audit](STARTER-KIT-AUDIT.md) et stories R02/R03 du [sprint](SPRINT-00R-SCRUM.md). Ce document décrit le travail à réaliser ; il n’effectue aucune bascule.

## 1. Qualifier et préserver l’existant

Relever le moteur réellement utilisé sans publier de secret : l’exemple indique SQLite, mais l’environnement effectif peut avoir changé. Dénombrer les lignes et les relations utiles, sans exporter les données personnelles dans les preuves. Identifier utilisateurs, passkeys, secrets 2FA, tokens, sessions et travaux en attente. Sauvegarder de manière cohérente la base existante, son schéma et la configuration sensible dans un emplacement protégé.

Deux branches :

- **Données de démonstration seulement, abandon confirmé par le propriétaire** : créer PostgreSQL à partir des migrations Laravel, puis uniquement les fixtures explicitement autorisées. Conserver la sauvegarde SQLite jusqu’à la validation finale.
- **Comptes ou données à conserver, ou doute** : préparer une migration de données répétable sur copie avant bascule. Le ticket de transfert devient obligatoire et la charge du sprint est réévaluée. Une modification du nom du moteur ne transfère aucune ligne.

## 2. Préparer les destinations

Réutiliser PostgreSQL 17 Windows ; créer des bases séparées pour développement, intégration backend, E2E et restauration. Noms proposés : orya_core_dev, orya_core_test, orya_core_e2e et orya_core_restore. Rôles distincts non superutilisateurs ; aucun rôle de test ne doit pouvoir modifier les bases des autres environnements. Sur recette, séparer le rôle de migration du rôle applicatif. Vérifier les privilèges effectifs, y compris schémas, tables et séquences.

Valider le driver PostgreSQL dans le PHP Windows réellement lancé par les terminaux et scripts. PostgreSQL ne reçoit que les connexions nécessaires. Le frontend n’accède jamais directement à la base. Dev, CI et recette partagent la même majeure PostgreSQL et une convention UTC explicite.

## 3. Supprimer les dépendances actives à SQLite

| Zone à adapter | Travail attendu |
|---|---|
| Exemple d’environnement racine et configuration DB | Décrire PostgreSQL, ses paramètres et la priorité éventuelle de DB_URL ; aucun repli silencieux vers SQLite |
| Scripts Composer de préparation/création | Retirer la création automatique SQLite ; préserver une APP_KEY existante ; toute migration échouée doit interrompre la préparation |
| Ancien script de provisionnement | Remplacer les chemins apps/api par la racine, gérer la présence des environnements sans écrasement et documenter la reprise après création partielle |
| phpunit.xml et amorçage Pest | Connexion PostgreSQL réservée aux tests ; contrôle avant toute préparation destructive ; configurations réelles pour la suite d’intégration |
| Préparation et configuration Playwright | Base E2E dédiée, environnement explicitement propagé au seeder, à Laravel, au worker et à Next ; ports dédiés, pas de réutilisation arbitraire du serveur dev |
| Workflows tests et E2E | PostgreSQL 17 et Redis natifs ; supprimer la préparation SQLite des parcours de validation |
| Documentation et Docker hérité | README orienté Windows natif ; isoler la voie Docker/MySQL comme hors périmètre, jamais comme recette validée |

Il n’est pas nécessaire de supprimer les définitions de drivers inutilisés fournies par Laravel ; ce sont les chemins effectivement utilisés qui doivent être sans ambiguïté. Ne pas supprimer les migrations de sessions, utilisateurs, tokens ou passkeys désormais nécessaires au starter.

## 4. Valider le schéma sur une base vide

Appliquer les migrations dans leur ordre puis vérifier qu’une seconde application n’introduit aucune mutation inattendue. Examiner types, longueurs, valeurs nulles, JSON des passkeys, dates, index uniques, relations et suppressions en cascade. Les indications de position de colonne utilisées par les migrations 2FA ne doivent pas devenir une dépendance métier.

Documenter la normalisation des emails dans inscription, connexion, modification de profil et import. Rechercher les collisions avant import ; ne pas supposer les comparaisons et contraintes identiques entre SQLite et PostgreSQL. Tester notamment deux adresses ne différant que par la casse et deux créations concurrentes de la même identité normalisée.

Conserver les clés primaires numériques et vérifier les séquences après import manuel d’identifiants. Vérifier les limites entières et l’architecture PHP 64 bits. Ne pas introduire maintenant un changement global d’UUID, de collation ou de modèle multi-tenant.

## 5. Transférer les données si nécessaire

Faire un essai sur copie, avec rapport de correspondance par table. Préserver identifiants utilisateurs, hashes de mots de passe, clés étrangères et credentials passkeys ; transporter le JSON sans altération. Préserver la clé de chiffrement requise pour relire la 2FA dans le même environnement, et vérifier un compte témoin avec 2FA. L’import ne réinitialise pas silencieusement les facteurs de sécurité.

Décider explicitement du traitement des sessions, tokens de réinitialisation et tokens API. Proposition : déconnexion générale à la bascule et invalidation des liens de récupération en cours ; révocation ou conservation des tokens API selon leur usage réel. Les caches se reconstruisent. Les jobs sont drainés ou repris selon un inventaire pour éviter leur perte ou double traitement. Aucun travail en attente n’est jeté sans décision.

Les passkeys dépendent aussi du domaine de confiance et des origines WebAuthn : conserver ces valeurs pour une simple migration de base ; changer le domaine réclame une décision et des essais distincts.

Comparer décomptes, références, séquences, statuts et échantillons fonctionnels sans exposer les secrets. L’absence d’erreur de l’import ne suffit pas.

## 6. Bascule et retour arrière

Après répétition réussie, annoncer une fenêtre sans écritures, arrêter les producteurs/consommateurs concernés, produire une sauvegarde cohérente finale, transférer, vérifier, basculer la configuration puis rafraîchir les caches et redémarrer les processus. Conserver l’ancien stockage en lecture seule pendant la période de validation.

Avant toute nouvelle écriture PostgreSQL, un retour à la source sauvegardée reste simple. Après de nouvelles écritures, revenir directement à SQLite perdrait ces changements : privilégier correction en avant ou rapprochement contrôlé avant retour. Définir le responsable de la décision et le point de non-retour avant la bascule.

En fin de recette, restaurer une sauvegarde PostgreSQL dans orya_core_restore, vérifier schéma et donnée témoin, puis exécuter le parcours de connexion sur cette copie isolée. La sauvegarde sensible reste hors Git ; seule la preuve synthétique est versionnée.
