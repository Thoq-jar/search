/*
 * Copyright (c) Search 2024-2025.
 * This file is a part of the Search project.
 * Search Repo: http://github.com/thoq-jar/search
 *
 * You should have received a copy of
 * the MIT License with the project,
 * if not, you may get a copy here:
 * MIT License: https://opensource.org/license/mit
 */
document.addEventListener("DOMContentLoaded", () => {
    const searchContainer = document.getElementById("search-container");
    const searchBar = document.getElementById("search-bar");
    const searchForm = document.getElementById("search-form");
    const searchButton = document.getElementById("search-button");
    const resultsContainer = document.getElementById("results-container");

    function hideSearchContainer() {
        searchContainer.classList.add("hidden");
    }

    function showResultsContainer() {
        resultsContainer.classList.remove("hidden");
    }

    function renderResults(jsonResults) {
        showResultsContainer();

        resultsContainer.innerHTML = '';

        Array.from(jsonResults.results).forEach(result => {
            const resultElement = document.createElement("div");
            resultElement.classList.add("result");

            const titleElement = document.createElement("div");
            titleElement.classList.add("result-title");
            titleElement.textContent = result.title;

            const descriptionElement = document.createElement("div");
            descriptionElement.classList.add("result-description");
            descriptionElement.textContent = result.snippet;

            const urlElement = document.createElement("a");
            urlElement.classList.add("result-url");
            urlElement.href = "https://" + result.url;
            urlElement.textContent = result.url;

            resultElement.appendChild(titleElement);
            resultElement.appendChild(descriptionElement);
            resultElement.appendChild(urlElement);
            resultsContainer.appendChild(resultElement);
        });
    }

    searchForm.addEventListener("submit", async(event) => {
        event.preventDefault();

        const query = searchBar.value;
        const searchUrl = `/api/search?query=${encodeURI(query)}`;
        const result = await fetch(searchUrl, {
            method: "POST",
        }).catch(error => alert("An error occurred: " + error));
        const data = await result.json();

        searchBar.value = "";
        hideSearchContainer();
        renderResults(data);
    });

    searchButton.addEventListener("click", () => {
        searchForm.submit();
    });
});
