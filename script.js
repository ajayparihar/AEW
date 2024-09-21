/* 
  Author: Ajay Singh
  Version: 1.0
  Date: 21-09-2024
  Description: JavaScript for the AEW application. Fetches project data from Google Sheets and updates the UI.
*/

// Constants
const API_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRT_ixy3nU4dbCgnMMyR05vP4dQePsnwZ4_UgCuP-x0XdcHVv9X87v6kYP-q2ouBk8UIaK8khj80FJ3/pub?gid=1138944004&single=true&output=csv';
const NO_RECORDS_MESSAGE = 'Nothing to revise today. Enjoy your day!';
const ERROR_MESSAGE = 'Error fetching the CSV data. Please try again later.';

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const cardContainer = document.getElementById('card-container');
const projectCountDisplay = document.getElementById('projects-count');
const citiesCountDisplay = document.getElementById('cities-count');
const companiesCountDisplay = document.getElementById('companies-count');
const logo = document.getElementById('logo');
const headerTitle = document.getElementById('header-title');

// Variables
let totalProjects = 0;
let cities = new Set();
let companies = new Set();

// Functions
const showLoadingScreen = () => {
    loadingScreen.style.display = 'flex';
};

const hideLoadingScreen = () => {
    loadingScreen.style.display = 'none';
};

const updateDashboardCounts = () => {
    projectCountDisplay.textContent = totalProjects;
    citiesCountDisplay.textContent = cities.size;
    companiesCountDisplay.textContent = companies.size;
};

const createCard = (index, company, place, customer, phone, project) => {
    const card = document.createElement('div');
    card.className = 'card';

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const cardFront = document.createElement('div');
    cardFront.className = 'card-face front';
    cardFront.innerHTML = `
        <div class="card-number">${index + 1}</div>
        <div class="company-name">${company}</div>
        <div class="place-name">${place}</div>
    `;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face back';
    cardBack.innerHTML = `
        <div class="company-name">${company}</div>
        <div class="customer-name">${customer.split(':').join('<br>')}</div>
        <div class="project-description">${project}</div>
        <div class="place-name">${place}</div>
        ${createPhoneNumbers(phone)}
    `;

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });

    return card;
};

const createPhoneNumbers = (phone) => {
    const phoneNumbers = phone.match(/\d{10}/g);
    if (!phoneNumbers) return '';

    return `<div class="phone-numbers">
        ${phoneNumbers.map(num => `
            <i class="fas fa-phone phone-icon" data-number="${num.trim()}"></i>
        `).join('')}
    </div>`;
};

const attachPhoneClickListeners = () => {
    const phoneIcons = document.querySelectorAll('.phone-icon');
    phoneIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            const number = event.target.getAttribute('data-number');
            if (confirm(`Do you want to call this number: ${number}?`)) {
                window.location.href = `tel:${number}`;
            }
            event.stopPropagation(); // Prevent card flip
        });
    });
};

const fetchCSVData = async () => {
    showLoadingScreen();
    try {
        const response = await fetch(API_URL);
        
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.text();
        processCSVData(data);
    } catch (error) {
        console.error('Fetch error:', error); // Log detailed error
        cardContainer.innerHTML = `<p>${ERROR_MESSAGE}</p>`;
    } finally {
        hideLoadingScreen();
    }
};

const processCSVData = (data) => {
    console.log('CSV Data:', data); // Log the raw CSV data
    const rows = data.split('\n').filter(row => row.trim() !== '').slice(1); // Skip header
    totalProjects = rows.length;
    cardContainer.innerHTML = ''; // Clear existing cards

    if (totalProjects === 0) {
        cardContainer.innerHTML = `<p>${NO_RECORDS_MESSAGE}</p>`;
        return;
    }

    rows.forEach((row, index) => {
        const columns = row.split(',');
        if (columns.length === 5) {
            const [company, place, customer, phone, project] = columns.map(col => col.trim());
            companies.add(company);
            cities.add(place);

            const card = createCard(index, company, place, customer, phone, project);
            cardContainer.appendChild(card);
        } else {
            console.warn(`Skipping malformed row ${index + 1}: ${row}`);
        }
    });

    updateDashboardCounts();
    attachPhoneClickListeners(); // Attach listeners after creating cards
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    fetchCSVData();

    // Add click event listeners for logo and header title
    logo.addEventListener('click', () => {
        location.reload();
    });

    headerTitle.addEventListener('click', () => {
        location.reload();
    });
});
