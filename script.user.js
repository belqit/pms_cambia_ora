// ==UserScript==
// @name         Timesheet Auto-Select
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Auto-select orario e resize textarea in base al tab (Standard Work / Off Work)
// @author       Griba
// @match        https://pms.betacomservices.com/timesheet*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Valori select: ogni option rappresenta 30 minuti.
    // value=0 => 00:00, value=18 => 09:00, value=39 => 19:30, ecc.
    // Formula: value = ore * 2 + (minuti === 30 ? 1 : 0)
    const CONFIG = {
        standard: {
            componentSelector: 'add-edit-worklog',
            tempFromValue: '39', // 19:30
            tempToValue: null,   // non toccare
            setOreToZero: true
        },
        offwork: {
            componentSelector: 'add-edit-offworklog',
            tempFromValue: '18', // 09:00
            tempToValue: '36',   // 18:00 - cambia se serve
            setOreToZero: false  // nel tab Off Work "Ore" va calcolato dalla differenza
        }
    };

    function isVisible(element) {
        return element &&
               element.offsetParent !== null &&
               window.getComputedStyle(element).display !== 'none' &&
               window.getComputedStyle(element).visibility !== 'hidden';
    }

    function setSelectValue(selectElement, value) {
        const option = selectElement.querySelector(`option[value="${value}"]`);
        if (!option) {
            console.log(`Option with value="${value}" not found`);
            return false;
        }
        selectElement.value = option.value;
        option.selected = true;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        selectElement.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`Set select to ${option.textContent} (value=${value})`);
        return true;
    }

    function resizeTextareas(modal) {
        modal.querySelectorAll('textarea').forEach(ta => {
            ta.style.minHeight = '150px';
            ta.style.height = '150px';
            ta.style.resize = 'vertical';
        });
    }

    function setOreToZero(component) {
        const inputNumbers = component.querySelectorAll('input-number input[type="number"]');
        if (inputNumbers.length > 0) {
            const oreInput = inputNumbers[0];
            oreInput.value = '0';
            oreInput.dispatchEvent(new Event('input', { bubbles: true }));
            oreInput.dispatchEvent(new Event('change', { bubbles: true }));
            oreInput.dispatchEvent(new Event('blur', { bubbles: true }));
            console.log('Set "Ore" input field to 0');
        }
    }

    function processSelect(selectElement) {
        const modal = document.querySelector('ngb-modal-window');
        if (!modal) return false;

        // Determina il tipo di tab cercando quale componente è presente
        let config = null;
        let component = null;
        for (const key of Object.keys(CONFIG)) {
            const c = modal.querySelector(CONFIG[key].componentSelector);
            if (c) {
                config = CONFIG[key];
                component = c;
                console.log(`Detected tab: ${key}`);
                break;
            }
        }

        if (!config) {
            console.log('No known worklog component found');
            return false;
        }

        // Imposta #tempfrom
        if (!setSelectValue(selectElement, config.tempFromValue)) {
            return false;
        }

        // Imposta #tempto (se previsto dal config)
        if (config.tempToValue !== null) {
            const tempToElement = modal.querySelector('#tempto');
            if (tempToElement) {
                setSelectValue(tempToElement, config.tempToValue);
            }
        }

        // Resize textarea
        resizeTextareas(modal);

        // Imposta "Ore" a 0 (solo Standard Work)
        if (config.setOreToZero) {
            setOreToZero(component);
        }

        return true;
    }

    // WeakSet traccia il nodo DOM: al cambio tab Angular crea un nuovo <select>,
    // quindi viene riprocessato automaticamente.
    const processedElements = new WeakSet();

    function checkAndProcess() {
        const selectElement = document.querySelector('#tempfrom');
        if (selectElement && isVisible(selectElement) && !processedElements.has(selectElement)) {
            if (processSelect(selectElement)) {
                processedElements.add(selectElement);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setInterval(checkAndProcess, 500));
    } else {
        setInterval(checkAndProcess, 500);
    }

    const observer = new MutationObserver(checkAndProcess);

    function startObserver() {
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.body) {
        startObserver();
    } else {
        document.addEventListener('DOMContentLoaded', startObserver);
    }

})();
