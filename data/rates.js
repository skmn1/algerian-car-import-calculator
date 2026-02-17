/**
 * rates.js — Single source of truth for currency exchange rates.
 *
 * To integrate a live API in the future, replace the hardcoded
 * CURRENCY_RATES array with a fetch() call that returns the same
 * shape: { code, name, flag, official, parallel }.
 */
'use strict';

const CURRENCY_RATES = [
    { code: 'EUR', name: 'Euro',            flag: '🇪🇺', official: 153.00, parallel: 280.00 },
    { code: 'USD', name: 'US Dollar',       flag: '🇺🇸', official: 135.50, parallel: 248.00 },
    { code: 'GBP', name: 'British Pound',   flag: '🇬🇧', official: 178.80, parallel: 328.00 },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', official:  98.20, parallel: 178.00 },
    { code: 'CHF', name: 'Swiss Franc',     flag: '🇨🇭', official: 160.50, parallel: 293.00 },
    { code: 'TRY', name: 'Turkish Lira',    flag: '🇹🇷', official:   3.50, parallel:   6.40 },
    { code: 'AED', name: 'UAE Dirham',      flag: '🇦🇪', official:  36.90, parallel:  67.50 },
    { code: 'CNY', name: 'Chinese Yuan',    flag: '🇨🇳', official:  18.90, parallel:  34.50 }
];

const RATES_LAST_UPDATED = '2026-02-15';
