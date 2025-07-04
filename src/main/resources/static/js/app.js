document.addEventListener("DOMContentLoaded", () => {
    const searchContainer = document.getElementById("search-container");
    const searchBar = document.getElementById("search-bar");
    const searchForm = document.getElementById("search-form");
    const searchButton = document.getElementById("search-button");
    const resultsContainer = document.getElementById("results-container");
    const homepageSection = document.getElementById("homepage-section");

    if(window.location.toString().includes("?q=")) {
        const query = decodeURIComponent(window.location.search.split("=")[1]);
        searchBar.value = query;
        performSearchWithoutRedirect(query).then();
    }

    function hideSearchContainer() {
        searchContainer.classList.add("hidden");
        homepageSection.classList.add("hidden");
    }

    function showResultsContainer() {
        resultsContainer.classList.remove("hidden");
    }

    function renderResults(jsonResults) {
        showResultsContainer();

        resultsContainer.innerHTML = '';

        const results = jsonResults?.results || [];

        if(results.length === 0) {
            const noResultsElement = document.createElement("div");
            noResultsElement.classList.add("no-results");
            noResultsElement.classList.add("brand-tag");
            noResultsElement.textContent = "No results found";
            resultsContainer.appendChild(noResultsElement);
            return;
        }

        results.forEach(result => {
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
            urlElement.target = "_blank";

            resultElement.appendChild(titleElement);
            resultElement.appendChild(descriptionElement);
            resultElement.appendChild(urlElement);
            resultsContainer.appendChild(resultElement);
        });
    }

    async function performSearchWithoutRedirect(query) {
        const searchUrl = `/api/search?query=${encodeURI(query)}`;
        const result = await fetch(searchUrl, {
            method: "GET",
            signal: AbortSignal.timeout(30000)
        }).catch(error => alert("An error occurred: " + error));

        const data = await result.json();

        hideSearchContainer();
        renderResults(data);
    }

    async function performSearch(query) {
        const searchUrl = `/api/search?query=${encodeURI(query)}`;
        const result = await fetch(searchUrl, {
            method: "GET",
            signal: AbortSignal.timeout(30000)
        }).catch(error => alert("An error occurred: " + error));

        const data = await result.json();

        window.history.pushState({}, '', "?q=" + encodeURI(query));

        hideSearchContainer();
        renderResults(data);
    }

    searchForm.addEventListener("submit", async(event) => {
        event.preventDefault();

        const query = searchBar.value;
        performSearch(query).then();
        searchBar.value = "";
    });

    searchButton.addEventListener("click", () => {
        searchForm.submit();
    });
});
