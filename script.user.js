// ==UserScript==
// @name         Timesheet Auto-Select Option 39
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically select option 39 in #tempfrom select when visible
// @author       Griba
// @match        https://pms.betacomservices.com/timesheet*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Function to check if element is visible
    function isVisible(element) {
        return element &&
               element.offsetParent !== null &&
               window.getComputedStyle(element).display !== 'none' &&
               window.getComputedStyle(element).visibility !== 'hidden';
    }

    // Function to select the 39th option and set input to 0
    function selectOption39() {
        const selectElement = document.querySelector('#tempfrom');

        if (selectElement && isVisible(selectElement)) {
            const option39 = selectElement.querySelector('option:nth-child(39)');

            if (option39) {
                // Set the selected option
                selectElement.value = option39.value;
                option39.selected = true;

                // Trigger change events to ensure the selection is processed
                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                selectElement.dispatchEvent(new Event('input', { bubbles: true }));

                console.log('Auto-selected option 39 in #tempfrom:', option39.textContent);

                // Also set the input field to 0
                const inputElement = document.querySelector('body > ngb-modal-window > div > div > div.modal-body.px-0.pt-3 > div.px-4.pt-3.tab-content > div > add-edit-worklog > div > div:nth-child(8) > div:nth-child(2) > input-number > div > input');

                if (inputElement) {
                    inputElement.value = '0';
                    // Trigger events for the input field
                    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                    inputElement.dispatchEvent(new Event('blur', { bubbles: true }));
                    console.log('Set input field to 0');
                } else {
                    console.log('Input field not found');
                }

                return true; // Successfully selected
            } else {
                console.log('Option 39 not found in #tempfrom select');
            }
        }
        return false; // Not found or not visible
    }

    // Track which elements we've already processed to avoid duplicate selections
    const processedElements = new WeakSet();

    // Function to start continuous monitoring for the select element
    function startContinuousMonitoring() {
        setInterval(() => {
            const selectElement = document.querySelector('#tempfrom');

            if (selectElement && isVisible(selectElement) && !processedElements.has(selectElement)) {
                if (selectOption39()) {
                    processedElements.add(selectElement);
                }
            }
        }, 500); // Check every 500ms continuously
    }

    // Start continuous monitoring when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startContinuousMonitoring);
    } else {
        startContinuousMonitoring();
    }

    // Also use MutationObserver to catch dynamically added elements immediately
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Check if #tempfrom was added
                const selectElement = document.querySelector('#tempfrom');
                if (selectElement && isVisible(selectElement) && !processedElements.has(selectElement)) {
                    if (selectOption39()) {
                        processedElements.add(selectElement);
                    }
                }
            }
        });
    });

    // Start observing when document is ready
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

})();
