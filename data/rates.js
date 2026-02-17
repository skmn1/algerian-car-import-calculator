/**
 * rates.js — Single source of truth for currency exchange rates.
 *
 * To integrate a live API in the future, replace the hardcoded
 * CURRENCY_RATES array with a fetch() call that returns the same
 * shape: { code, name, flag, official, parallel }.
 */
'use strict';

const CURRENCY_RATES = [
    { code: 'USD', name: 'US Dollar',       flag: '🇺🇸', official: 135.50, parallel: 248.00 },
    { code: 'EUR', name: 'Euro',            flag: '🇪🇺', official: 153.00, parallel: 280.00 },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', official:  98.20, parallel: 178.00 },
    { code: 'CNY', name: 'Chinese Yuan',    flag: '🇨🇳', official:  18.90, parallel:  34.50 }
];
