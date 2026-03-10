# 🏝️ Swaply | Découvre & Troque

Swaply est une marketplace locale moderne conçue pour simplifier le troc à Lomé. Alliant intelligence artificielle, design premium et systèmes de confiance, l'application offre une expérience fluide de découverte et d'échange d'objets.

---

## ✨ Points Forts & Fonctionnalités

### 📸 Magie IA & Publication Intelligente
- **Analyse Multi-Photos** : Système d'analyse par IA qui valide la qualité des photos, identifie l'objet et suggère automatiquement un titre, une catégorie et une valeur en crédits.
- **Guide Photo Intelligent** : Scanner pas à pas avec cadres de guidage pour garantir des photos parfaites dès la prise.
- **Auto-Fill** : Remplissage automatique des champs basé sur la première photo pour une publication en moins de 30 secondes.

### 🃏 Discovery Swipe (Style C)
- **Expérience Immersive** : Interface type "Tinder" pour découvrir les objets disponibles à proximité.
- **Proximité Réelle** : Affichage de la distance (ex: 📍 800m) pour favoriser les échanges locaux.
- **Actions Rapides** : Swipe à droite pour réserver, à gauche pour passer.

### 🛡️ Sécurité & Confiance (Phase 1)
- **Validation par QR Code** : Système de validation physique par rencontre. Le propriétaire génère un code, le demandeur le scanne pour valider l'échange.
- **Transfert Atomique** : Les crédits sont transférés instantanément lors de la validation du scan.
- **Trust Score & Avis** : Système de réputation basé sur les retours d'échanges pour garantir une communauté fiable.

### 💎 Économie Circulaire ("Swaps")
- **Monnaie Interne (SC)** : Utilisation de Swaps pour valoriser les objets et équilibrer les échanges.
- **Circuit Fermé & Conforme** : Recharge possible via Mobile Money (Flooz/T-Money), mais **pas de conversion en cash**. 
- **Modèle Dual-Token** : Distinction entre Swaps réels et Promo Swaps (bonus d'onboarding avec expiration).
- **Burn Mechanism** : Taxe de **2%** sur les transactions Swaps pour stabiliser la masse monétaire et compenser les bonus.
- **Troc Hybride** : Possibilité de compléter un échange avec un appoint en Swaps pour faciliter le matching.

### 📱 Progressiv Web App (PWA)
- **Installable** : Installez Swaply sur votre écran d'accueil comme une application native.
- **Offline Ready** : Support de base pour la consultation hors-ligne.
- **Mobile-First** : Design optimisé pour une utilisation à une main avec une navigation fluide.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 16 (App Router)](https://nextjs.org/)
- **Base de Données** : [PostgreSQL](https://www.postgresql.org/) avec [Prisma ORM](https://www.prisma.io/)
- **Authentification** : [Supabase Auth](https://supabase.com/auth)
- **Paiements** : couche providers avec `Stripe Checkout`, webhooks App Router et adaptateurs HTTP pour Mobile Money
- **Intelligence Artificielle** : OpenRouter / Qwen pour l'analyse et l'assistance IA
- **Validation QR** : `qrcode` & `html5-qrcode`
- **Animations** : [Framer Motion](https://www.framer.com/motion/) & [Lucide React](https://lucide.dev/)

---

## 🚀 Installation Locale

1. **Cloner le projet** :
   ```bash
   git clone <repo-url>
   cd Swaply
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :
   Créez un fichier `.env` basé sur `.env.example` avec vos accès Supabase, Prisma, Uploadthing, OpenRouter et paiements.

   Variables clés pour les paiements :
   - `NEXT_PUBLIC_APP_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PAYMENT_PROVIDER_<CODE>_INIT_URL`
   - `PAYMENT_PROVIDER_<CODE>_API_KEY`
   - `PAYMENT_PROVIDER_<CODE>_WEBHOOK_SECRET`

4. **Préparer la base de données** :
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

---

## 🗺️ Roadmap & État du Projet

- [x] **Phase 1-2** : Discovery Swipe, Smart Photo Guide (Gemini IA).
- [x] **Phase 3-4** : Justification de prix IA & Réseau "Swap Spots" (Lomé).
- [x] **Phase 5** : Système de crédits "Swaps" & Rewards.
- [x] **Phase 5.5** : Monétisation (Recharge Mobile Money) & Troc Hybride.
- [ ] **Phase 6** : Messagerie Avancée, Voice Notes & Badges de Confiance.

---

*Développé avec ❤️ pour Lomé.*
