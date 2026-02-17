/**
 * i18n.js — Internationalisation system.
 *
 * Exports: translations, currentLang, setLanguage(), t(), updatePageTranslations()
 * Depends on: fmt() from calculator.js (for currency table rendering)
 *             CURRENCY_RATES from data/rates.js
 */
'use strict';

const translations = {
    en: {
        pageTitle: 'Algerian Car Import Calculator',
        mainTitle: 'Car Import Calculator',
        subtitle: '🇩🇿 حاسبة استيراد السيارات للجزائر \u00A0|\u00A0 Accurate Landed Cost for Algeria',
        totalLandedCost: 'Total Landed Cost',
        centimes: 'centimes',
        totalEUR: 'Total EUR',
        carDetails: 'Car Details',
        carPrice: 'Car Price (EUR)',
        shippingCost: 'Shipping Cost (EUR)',
        exchangeRates: 'Exchange Rates',
        officialRate: 'Official Rate (DZD/EUR)',
        officialRateTip: 'Bank of Algeria official rate — used to calculate customs tax base only.',
        parallelRate: 'Parallel Rate / Square (DZD/EUR)',
        parallelRateTip: 'Real street/market rate (Square) — used to calculate the actual cost of buying euros.',
        feesAndTaxes: 'Fees & Taxes',
        customsTax: 'Customs Tax (%)',
        customsTaxTip: 'Applied ONLY to the car price using the official rate. Shipping is excluded from the customs base.',
        portFees: 'Port & Admin Fees (DZD)',
        portFeesTip: 'Includes port handling, documentation, storage & admin processing fees at the port of entry.',
        tvaDeduce: 'TVA Déductible (19%)',
        tvaTip: 'Deduct 19% — For NIF-registered businesses only. Reduces car price before all calculations.',
        tvaSavings: '✓ TVA savings:',
        costBreakdown: 'Cost Breakdown',
        component: 'Component',
        amount: 'Amount (DZD)',
        rate: 'Rate',
        carCost: 'Car Cost',
        vatBadge: '−19% TVA',
        shippingLabel: 'Shipping Cost',
        customsLabel: 'Customs Tax',
        customsDetail: '(% on car price only)',
        portLabel: 'Port & Admin Fees',
        total: 'TOTAL',
        parallel: 'Parallel',
        official: 'Official',
        fixed: 'Fixed',
        infoBox: 'How it works:',
        infoText: 'Car purchase & shipping are converted at the parallel rate (what you actually pay). Customs tax is calculated only on the car price using the official rate (government valuation). Shipping is excluded from the customs base.',
        footer: '🇩🇿 Made for Algerian car importers \u00A0|\u00A0 Exchange rates fluctuate — always verify before purchasing',
        saveCalculation: 'Save Calculation',
        enterCarName: 'Enter Car Name/Model',
        cancelBtn: 'Cancel',
        saveBtn: 'Save',
        calculationHistory: 'Calculation History',
        historyLimitNote: '<strong>Max 5</strong> calculations saved. Entries expire after <strong>24 hours</strong> automatically.',
        delete: 'Delete',
        details: 'Details',
        introTitle: 'Professional Car Import Cost Calculator',
        introDesc: 'Advanced calculation engine designed for Algerian automotive importers. Accurately processes dual exchange rate systems, customs regulations, and VAT deductions with precision.',
        developedBy: 'Developed By',
        trustBadge: 'Trusted by Import Professionals',
        footerAboutTitle: 'About',
        footerAboutText: 'Professional-grade import cost calculator engineered for accuracy and ease of use. Handles Algeria\'s complex dual exchange rate system with precision.',
        footerFeaturesTitle: 'Key Features',
        footerFeature1: 'Dual Exchange Rate Logic',
        footerFeature2: 'Real-time Calculations',
        footerFeature3: 'Mobile Optimized',
        footerFeature4: 'Calculation History',
        footerDeveloperTitle: 'Developer',
        footerDeveloperRole: 'Full-Stack Developer',
        footerDeveloperDesc: 'Specialized in financial calculators and enterprise web applications.',
        footerSecure: 'Secure & Private — All calculations performed locally',
        footerUpdated: 'Updated: February 2026',
        footerDisclaimerTitle: 'Important Notice',
        footerDisclaimer: 'Exchange rates fluctuate daily. Always verify current rates with official sources before making purchase decisions. This calculator provides estimates and should not be considered financial advice.',
        footerCopyright: 'Made with precision for Algerian car importers',
        footerRights: 'All rights reserved',
        currencyRatesTitle: 'Exchange Rate Reference',
        currencyRatesDesc: 'Reference rates for the Algerian Dinar (DZD). Data is indicative — always verify with current sources.',
        currency: 'Currency',
        officialRateShort: 'Official',
        parallelRateShort: 'Parallel'
    },
    fr: {
        pageTitle: 'Calculatrice d\'Importation de Voitures en Algérie',
        mainTitle: 'Calc. Importation Voiture',
        subtitle: '🇩🇿 حاسبة استيراد السيارات للجزائر \u00A0|\u00A0 Coût d\'arrivée précis pour l\'Algérie',
        totalLandedCost: 'Coût Total Rendu',
        centimes: 'centimes',
        totalEUR: 'Total EUR',
        carDetails: 'Détails Voiture',
        carPrice: 'Prix Voiture (EUR)',
        shippingCost: 'Frais Livraison (EUR)',
        exchangeRates: 'Taux de Change',
        officialRate: 'Taux Officiel (DZD/EUR)',
        officialRateTip: 'Taux officiel de la Banque d\'Algérie — utilisé pour calculer uniquement la base de la taxe douanière.',
        parallelRate: 'Taux Parallèle / Square (DZD/EUR)',
        parallelRateTip: 'Taux réel du marché (Square) — utilisé pour calculer le coût réel d\'achat d\'euros.',
        feesAndTaxes: 'Frais & Taxes',
        customsTax: 'Taxe Douanière (%)',
        customsTaxTip: 'Appliquée UNIQUEMENT au prix de la voiture au taux officiel. Livraison exclue de la base douanière.',
        portFees: 'Frais Port & Admin (DZD)',
        portFeesTip: 'Inclut manutention au port, documentation, stockage & frais administratifs au port d\'entrée.',
        tvaDeduce: 'TVA Déductible (19%)',
        tvaTip: 'Déduire 19% — Réservé aux entreprises enregistrées au NIF. Réduit le prix de la voiture avant tous les calculs.',
        tvaSavings: '✓ Économie TVA:',
        costBreakdown: 'Ventilation des Coûts',
        component: 'Composant',
        amount: 'Montant (DZD)',
        rate: 'Taux',
        carCost: 'Coût Voiture',
        vatBadge: '−19% TVA',
        shippingLabel: 'Coût Livraison',
        customsLabel: 'Taxe Douanière',
        customsDetail: '(% prix voiture uniquement)',
        portLabel: 'Frais Port & Admin',
        total: 'TOTAL',
        parallel: 'Parallèle',
        official: 'Officiel',
        fixed: 'Fixe',
        infoBox: 'Comment ça marche:',
        infoText: 'L\'achat de voiture & livraison sont convertis au taux parallèle (ce que vous payez réellement). La taxe douanière est calculée uniquement sur le prix de la voiture au taux officiel (évaluation gouvernementale). Livraison exclue de la base douanière.',
        footer: '🇩🇿 Fait pour les importateurs de voitures algériens \u00A0|\u00A0 Les taux de change fluctuent — vérifiez toujours avant d\'acheter',
        saveCalculation: 'Enregistrer le Calcul',
        enterCarName: 'Entrez le Nom/Modèle de la Voiture',
        cancelBtn: 'Annuler',
        saveBtn: 'Enregistrer',
        calculationHistory: 'Historique des Calculs',
        historyLimitNote: '<strong>Max 5</strong> calculs sauvegardés. Les entrées expirent après <strong>24 heures</strong> automatiquement.',
        delete: 'Supprimer',
        details: 'Détails',
        introTitle: 'Calculateur Professionnel de Co\u00FBts d\u2019Importation',
        introDesc: 'Moteur de calcul avanc\u00E9 con\u00E7u pour les importateurs automobiles alg\u00E9riens. Traite avec pr\u00E9cision les syst\u00E8mes de taux de change doubles, les r\u00E9glementations douani\u00E8res et les d\u00E9ductions de TVA.',
        developedBy: 'Développé Par',
        trustBadge: 'Approuvé par les professionnels',
        footerAboutTitle: 'À propos',
        footerAboutText: 'Calculateur d\u2019importation professionnel con\u00E7u pour la pr\u00E9cision et la facilit\u00E9 d\u2019utilisation. G\u00E8re le syst\u00E8me complexe de double taux de change de l\u2019Alg\u00E9rie avec pr\u00E9cision.',
        footerFeaturesTitle: 'Fonctionnalités clés',
        footerFeature1: 'Logique de Double Taux de Change',
        footerFeature2: 'Calculs en Temps Réel',
        footerFeature3: 'Optimisé Mobile',
        footerFeature4: 'Historique des Calculs',
        footerDeveloperTitle: 'Développeur',
        footerDeveloperRole: 'Développeur Full-Stack',
        footerDeveloperDesc: 'Spécialisé dans les calculateurs financiers et les applications web d\u2019entreprise.',
        footerSecure: 'Sécurisé et Privé — Tous les calculs s\u2019effectuent localement',
        footerUpdated: 'Mis à jour : Février 2026',
        footerDisclaimerTitle: 'Avis Important',
        footerDisclaimer: 'Les taux de change fluctuent quotidiennement. V\u00E9rifiez toujours les taux actuels aupr\u00E8s de sources officielles avant de prendre des d\u00E9cisions d\u2019achat. Cette calculatrice fournit des estimations et ne doit pas \u00EAtre consid\u00E9r\u00E9e comme un conseil financier.',
        footerCopyright: 'Fait avec précision pour les importateurs de voitures algériens',
        footerRights: 'Tous droits réservés',
        currencyRatesTitle: 'Référence des Taux de Change',
        currencyRatesDesc: 'Taux de référence pour le Dinar algérien (DZD). Données indicatives — vérifiez toujours avec les sources actuelles.',
        currency: 'Devise',
        officialRateShort: 'Officiel',
        parallelRateShort: 'Parallèle'
    },
    ar: {
        pageTitle: 'حاسبة استيراد السيارات للجزائر',
        mainTitle: 'حاسبة الاستيراد',
        subtitle: '🇩🇿 حاسبة استيراد السيارات للجزائر \u00A0|\u00A0 حساب التكلفة الدقيق للجزائر',
        totalLandedCost: 'إجمالي التكلفة',
        centimes: 'سنتيم',
        totalEUR: 'الإجمالي EUR',
        carDetails: 'تفاصيل السيارة',
        carPrice: 'سعر السيارة (يورو)',
        shippingCost: 'رسوم الشحن (يورو)',
        exchangeRates: 'أسعار الصرف',
        officialRate: 'السعر الرسمي (دج/يورو)',
        officialRateTip: 'سعر بنك الجزائر الرسمي — يُستخدم لحساب أساس الضريبة الجمركية فقط.',
        parallelRate: 'السعر الموازي / السوق السوداء (دج/يورو)',
        parallelRateTip: 'سعر السوق الحقيقي — يُستخدم لحساب التكلفة الفعلية لشراء اليورو.',
        feesAndTaxes: 'الرسوم والضرائب',
        customsTax: 'الضريبة الجمركية (%)',
        customsTaxTip: 'تُطبق فقط على سعر السيارة بالسعر الرسمي. يتم استبعاد الشحن من أساس الضريبة الجمركية.',
        portFees: 'رسوم الميناء والإدارة (دج)',
        portFeesTip: 'تشمل المناولة بالميناء والتوثيق والتخزين والرسوم الإدارية عند ميناء الدخول.',
        tvaDeduce: 'الضريبة على القيمة المضافة القابلة للخصم (19%)',
        tvaTip: 'اخفض 19% — للشركات المسجلة برقم تعريفي فقط. يقلل سعر السيارة قبل جميع الحسابات.',
        tvaSavings: '✓ توفير الضريبة:',
        costBreakdown: 'تفصيل التكاليف',
        component: 'المكون',
        amount: 'المبلغ (دج)',
        rate: 'السعر',
        carCost: 'تكلفة السيارة',
        vatBadge: '−19% ضريبة',
        shippingLabel: 'تكلفة الشحن',
        customsLabel: 'الضريبة الجمركية',
        customsDetail: '(% على سعر السيارة فقط)',
        portLabel: 'رسوم الميناء والإدارة',
        total: 'الإجمالي',
        parallel: 'موازي',
        official: 'رسمي',
        fixed: 'ثابت',
        infoBox: 'كيف يعمل:',
        infoText: 'يتم تحويل شراء السيارة والشحن بالسعر الموازي (ما تدفعه فعليًا). يتم حساب الضريبة الجمركية فقط على سعر السيارة بالسعر الرسمي. يتم استبعاد الشحن من أساس الضريبة الجمركية.',
        footer: '🇩🇿 مصنوع لمستوردي السيارات الجزائريين \u00A0|\u00A0 أسعار الصرف تتقلب — تحقق دائمًا قبل الشراء',
        saveCalculation: 'حفظ الحساب',
        enterCarName: 'أدخل اسم/طراز السيارة',
        cancelBtn: 'إلغاء',
        saveBtn: 'حفظ',
        calculationHistory: 'سجل الحسابات',
        historyLimitNote: '<strong>الحد الأقصى 5</strong> حسابات محفوظة. تنتهي الصلاحية بعد <strong>24 ساعة</strong> تلقائياً.',
        delete: 'حذف',
        details: 'التفاصيل',
        introTitle: 'حاسبة تكلفة استيراد السيارات المحترفة',
        introDesc: 'محرك حساب متقدم مصمم لمستوردي السيارات الجزائريين. يعالج بدقة أنظمة أسعار الصرف المزدوجة واللوائح الجمركية وخصومات الضريبة.',
        developedBy: 'طوره',
        trustBadge: 'موثوق به من قبل محترفي الاستيراد',
        footerAboutTitle: 'نبذة',
        footerAboutText: 'حاسبة تكلفة استيراد مهنية مصممة للدقة وسهولة الاستخدام. تتعامل مع نظام سعر الصرف المزدوج المعقد في الجزائر بدقة.',
        footerFeaturesTitle: 'الميزات الرئيسية',
        footerFeature1: 'منطق سعر صرف مزدوج',
        footerFeature2: 'حسابات فورية',
        footerFeature3: 'محسّن للهاتف',
        footerFeature4: 'سجل الحسابات',
        footerDeveloperTitle: 'المطور',
        footerDeveloperRole: 'مطور Full-Stack',
        footerDeveloperDesc: 'متخصص في الحاسبات المالية وتطبيقات الويب المؤسسية.',
        footerSecure: 'آمن وخاص — جميع الحسابات تتم محلياً',
        footerUpdated: 'محدّث: فبراير 2026',
        footerDisclaimerTitle: 'ملاحظة مهمة',
        footerDisclaimer: 'تتقلب أسعار الصرف يومياً. تحقق دائماً من الأسعار الحالية مع المصادر الرسمية قبل اتخاذ قرارات الشراء. توفر هذه الحاسبة تقديرات ولا ينبغي اعتبارها نصيحة مالية.',
        footerCopyright: 'مصنوع بدقة لمستوردي السيارات الجزائريين',
        footerRights: 'جميع الحقوق محفوظة',
        currencyRatesTitle: 'مرجع أسعار الصرف',
        currencyRatesDesc: 'أسعار مرجعية للدينار الجزائري. البيانات إرشادية — تحقق دائماً من المصادر الحالية.',
        currency: 'العملة',
        officialRateShort: 'رسمي',
        parallelRateShort: 'موازي'
    },
    es: {
        pageTitle: 'Calculadora de Importación de Automóviles de Argelia',
        mainTitle: 'Calc. Importación Autos',
        subtitle: '🇩🇿 حاسبة استيراد السيارات للجزائر \u00A0|\u00A0 Costo de entrega preciso para Argelia',
        totalLandedCost: 'Costo Total Entregado',
        centimes: 'céntimos',
        totalEUR: 'Total EUR',
        carDetails: 'Detalles del Auto',
        carPrice: 'Precio del Auto (EUR)',
        shippingCost: 'Costo de Envío (EUR)',
        exchangeRates: 'Tasas de Cambio',
        officialRate: 'Tasa Oficial (DZD/EUR)',
        officialRateTip: 'Tasa oficial del Banco de Argelia — se utiliza solo para calcular la base del arancel aduanal.',
        parallelRate: 'Tasa Paralela / Mercado Negro (DZD/EUR)',
        parallelRateTip: 'Tasa de mercado real — se utiliza para calcular el costo real de compra de euros.',
        feesAndTaxes: 'Aranceles e Impuestos',
        customsTax: 'Impuesto Aduanal (%)',
        customsTaxTip: 'Se aplica SOLO al precio del auto utilizando la tasa oficial. El envío se excluye de la base aduanal.',
        portFees: 'Aranceles Portuarios y Administrativos (DZD)',
        portFeesTip: 'Incluye manipulación portuaria, documentación, almacenamiento y aranceles administrativos en el puerto de entrada.',
        tvaDeduce: 'IVA Deducible (19%)',
        tvaTip: 'Reducir 19% — Solo para empresas registradas con NIF. Reduce el precio del auto antes de todos los cálculos.',
        tvaSavings: '✓ Ahorro de IVA:',
        costBreakdown: 'Desglose de Costos',
        component: 'Componente',
        amount: 'Monto (DZD)',
        rate: 'Tasa',
        carCost: 'Costo del Auto',
        vatBadge: '−19% IVA',
        shippingLabel: 'Costo de Envío',
        customsLabel: 'Impuesto Aduanal',
        customsDetail: '(% solo en precio del auto)',
        portLabel: 'Aranceles Portuarios y Admin',
        total: 'TOTAL',
        parallel: 'Paralela',
        official: 'Oficial',
        fixed: 'Fijo',
        infoBox: 'Cómo funciona:',
        infoText: 'La compra de auto y envío se convierten a la tasa paralela (lo que realmente pagas). El impuesto aduanal se calcula solo sobre el precio del auto utilizando la tasa oficial (valoración gubernamental). El envío se excluye de la base aduanal.',
        footer: '🇩🇿 Hecho para importadores de autos argelinos \u00A0|\u00A0 Las tasas de cambio fluctúan — verifica siempre antes de comprar',
        saveCalculation: 'Guardar Cálculo',
        enterCarName: 'Ingrese Nombre/Modelo del Auto',
        cancelBtn: 'Cancelar',
        saveBtn: 'Guardar',
        calculationHistory: 'Historial de Cálculos',
        historyLimitNote: '<strong>Máx. 5</strong> cálculos guardados. Las entradas caducan después de <strong>24 horas</strong> automáticamente.',
        delete: 'Eliminar',
        details: 'Detalles',
        introTitle: 'Calculadora Profesional de Costos de Importación',
        introDesc: 'Motor de cálculo avanzado diseñado para importadores de automóviles argelinos. Procesa con precisión sistemas de tipo de cambio dual, regulaciones aduaneras y deducciones de IVA.',
        developedBy: 'Desarrollado Por',
        trustBadge: 'Confiado por profesionales de la importación',
        footerAboutTitle: 'Acerca de',
        footerAboutText: 'Calculadora de costos de importación de grado profesional diseñada para precisión y facilidad de uso. Maneja el complejo sistema de tipo de cambio dual de Argelia con precisión.',
        footerFeaturesTitle: 'Características Clave',
        footerFeature1: 'Lógica de Tipo de Cambio Dual',
        footerFeature2: 'Cálculos en Tiempo Real',
        footerFeature3: 'Optimizado para Móvil',
        footerFeature4: 'Historial de Cálculos',
        footerDeveloperTitle: 'Desarrollador',
        footerDeveloperRole: 'Desarrollador Full-Stack',
        footerDeveloperDesc: 'Especializado en calculadoras financieras y aplicaciones web empresariales.',
        footerSecure: 'Seguro y Privado — Todos los cálculos se realizan localmente',
        footerUpdated: 'Actualizado: Febrero 2026',
        footerDisclaimerTitle: 'Aviso Importante',
        footerDisclaimer: 'Los tipos de cambio fluctúan diariamente. Siempre verifique las tasas actuales con fuentes oficiales antes de tomar decisiones de compra. Esta calculadora proporciona estimaciones y no debe considerarse como asesoramiento financiero.',
        footerCopyright: 'Hecho con precisión para importadores de autos argelinos',
        footerRights: 'Todos los derechos reservados',
        currencyRatesTitle: 'Referencia de Tasas de Cambio',
        currencyRatesDesc: 'Tasas de referencia para el Dinar argelino (DZD). Datos indicativos — verifique siempre con fuentes actuales.',
        currency: 'Moneda',
        officialRateShort: 'Oficial',
        parallelRateShort: 'Paralela'
    }
};

let currentLang = localStorage.getItem('lang') || 'fr';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    // Handle RTL for Arabic
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }

    updatePageTranslations();

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function t(key) {
    return translations[currentLang]?.[key] || translations['en'][key] || key;
}

function updatePageTranslations() {
    // Page title
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = t('pageTitle');
    document.title = t('pageTitle');

    // All elements with data-i18n attribute (skip customsDetail — handled below)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key === 'customsDetail') return; // preserve inner <span id="customsPct">
        el.textContent = t(key);
    });

    // All elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = t(key);
    });

    // Specific manual updates for better control
    document.getElementById('mainTitle').textContent = t('mainTitle');
    document.getElementById('subtitle').innerHTML = t('subtitle');

    // Update customs detail text while preserving customsPct span
    const customsPctEl = document.getElementById('customsPct');
    if (customsPctEl) {
        const customsPct = document.getElementById('customsTax').value;
        customsPctEl.textContent = customsPct;
        // Update surrounding text in parent
        document.querySelectorAll('[data-i18n="customsDetail"]').forEach(el => {
            const span = el.querySelector('#customsPct');
            if (span) {
                el.innerHTML = '(<span id="customsPct">' + customsPct + '</span>% ' + (t('customsDetail').split('%')[1] || 'on car price only)');
            }
        });
    }

    // Render currency rates table with current language
    renderCurrencyTable();
}
