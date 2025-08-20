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

import LWR from "../lib/lwr.js";

class SearchApp {
    constructor() {
        this.elements = {};
        this.router = null;
        this.currentQuery = '';

        this.init();
    }

    init() {
        this.cacheElements();
        this.setupRouter();
        this.bindEvents();
    }

    cacheElements() {
        this.elements = {
            searchBar: document.getElementById("search-bar"),
            navSearchBar: document.getElementById("nav-search-bar"),
            searchForm: document.getElementById("search-form"),
            navSearchForm: document.getElementById("nav-search-form"),
            searchButton: document.getElementById("search-button"),
            navSearchButton: document.getElementById("nav-search-button"),
            resultsContainer: document.getElementById("results-container"),
            homepageSection: document.getElementById("homepage-section"),
            loadingContainer: document.getElementById("loading-container"),
            navHeader: document.getElementById("nav-header"),
            navLogo: document.getElementById("nav-logo")
        };
    }

    setupRouter() {
        this.router = new LWR({
            beforeRouteChange: (_to, _from) => {
                return true;
            },
            afterRouteChange: (_route) => {
            },
            notFound: (path) => {
                if(path === '/')
                    return;

                console.warn('Page not found:', path);
                this.showHomepage();
            }
        });

        this.router
            .addRoute('/', this.handleHomepage.bind(this), {
                name: 'home',
                meta: {title: 'Search'}
            })
            .addRoute('/search', this.handleSearchRoute.bind(this), {
                name: 'search',
                meta: {title: 'Search Results'}
            });
    }

    bindEvents() {
        if(this.elements.searchForm)
            this.elements.searchForm.addEventListener("submit", this.handleSearch.bind(this));

        if(this.elements.searchButton) {
            this.elements.searchButton.addEventListener("click", () => {
                this.elements.searchForm.dispatchEvent(new Event('submit'));
            });
        }

        if(this.elements.navSearchForm)
            this.elements.navSearchForm.addEventListener("submit", this.handleNavSearch.bind(this));

        if(this.elements.navSearchButton) {
            this.elements.navSearchButton.addEventListener("click", () => {
                this.elements.navSearchForm.dispatchEvent(new Event('submit'));
            });
        }

        if(this.elements.navLogo) {
            this.elements.navLogo.addEventListener("click", () => {
                this.router.navigate('/');
            });
        }
    }

    handleHomepage(_) {
        this.showHomepage();
        this.updatePageTitle('Search');
    }

    async handleSearchRoute(route) {
        const query = route.query.q;
        if(query) {
            this.currentQuery = decodeURIComponent(query);

            if(this.elements.searchBar)
                this.elements.searchBar.value = this.currentQuery;

            await this.performSearch(this.currentQuery);
            this.updatePageTitle(`Search Results for "${this.currentQuery}"`);
        } else {
            this.router.navigate('/');
        }
    }

    async handleSearch(event) {
        event.preventDefault();
        const query = this.elements.searchBar.value.trim();

        if(query)
            this.router.navigate(`/search?q=${encodeURIComponent(query)}`);
    }

    async handleNavSearch(event) {
        event.preventDefault();
        const query = this.elements.navSearchBar.value.trim();

        if(query)
            this.router.navigate(`/search?q=${encodeURIComponent(query)}`);
    }

    showLoading() {
        this.elements.loadingContainer?.classList.remove("hidden");
        this.elements.resultsContainer?.classList.add("hidden");
    }

    hideLoading() {
        this.elements.loadingContainer?.classList.add("hidden");
    }

    showHomepage() {
        this.elements.homepageSection?.classList.remove("hidden");
        this.elements.navHeader?.classList.add("hidden");
        this.elements.resultsContainer?.classList.add("hidden");
        this.hideLoading();

        if(this.elements.searchBar)
            this.elements.searchBar.value = '';
    }

    hideHomepage() {
        this.elements.homepageSection?.classList.add("hidden");
    }

    showNavigation() {
        this.elements.navHeader?.classList.remove("hidden");
    }

    showResultsContainer() {
        this.elements.resultsContainer?.classList.remove("hidden");
        this.hideLoading();
    }

    updatePageTitle(title) {
        document.title = title;
    }

    async performSearch(query) {
        this.showLoading();
        this.hideHomepage();
        this.showNavigation();

        if(this.elements.navSearchBar)
            this.elements.navSearchBar.value = query;

        try {
            const searchUrl = `/api/search?query=${encodeURIComponent(query)}`;
            const result = await fetch(searchUrl, {
                method: "GET",
                signal: AbortSignal.timeout(30000)
            });

            const data = await result.json();
            this.renderResults(data);

        } catch(error) {
            this.handleSearchError(error);
        } finally {
            this.hideLoading();
        }
    }

    renderResults(jsonResults) {
        this.showResultsContainer();
        this.elements.resultsContainer.innerHTML = '';

        const results = jsonResults?.results || [];

        if(results.length === 0) {
            const noResultsElement = document.createElement("div");
            noResultsElement.classList.add("no-results");
            noResultsElement.innerHTML = '<div class="brand-tag">No results found</div>';
            this.elements.resultsContainer.appendChild(noResultsElement);
            return;
        }

        results.forEach(result => {
            const resultElement = this.createResultElement(result);
            this.elements.resultsContainer.appendChild(resultElement);
        });
    }

    createResultElement(result) {
        const resultElement = document.createElement("div");
        const titleElement = document.createElement("a");
        const descriptionElement = document.createElement("div");
        const urlElement = document.createElement("a");
        const formattedUrl = result.url.startsWith('http') ? result.url : `https://${result.url}`;

        resultElement.classList.add("result");

        titleElement.classList.add("result-title");
        titleElement.textContent = result.title;
        titleElement.href = formattedUrl;
        titleElement.target = "_blank";
        titleElement.rel = "noopener noreferrer";
        titleElement.setAttribute('data-router', 'false');

        descriptionElement.classList.add("result-description");
        descriptionElement.textContent = result.snippet;

        urlElement.classList.add("result-url");
        urlElement.href = formattedUrl;
        urlElement.textContent = result.url;
        urlElement.target = "_blank";
        urlElement.rel = "noopener noreferrer";
        urlElement.setAttribute('data-router', 'false');

        resultElement.appendChild(titleElement);
        resultElement.appendChild(descriptionElement);
        resultElement.appendChild(urlElement);

        return resultElement;
    }

    handleSearchError(error) {
        console.error('Search error:', error);

        const errorElement = document.createElement("div");
        errorElement.classList.add("no-results");
        errorElement.innerHTML = `
            <div class="brand-tag">
                Search failed. Please try again.
                <br><small>${error.message}</small>
            </div>
        `;

        this.elements.resultsContainer.innerHTML = '';
        this.elements.resultsContainer.appendChild(errorElement);
        this.showResultsContainer();
    }

    search(query) {
        if(query)
            this.router.navigate(`/search?q=${encodeURIComponent(query)}`);
    }

    goHome() {
        this.router.navigate('/');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.searchApp = new SearchApp();

    window.search = (query) => window.searchApp.search(query);
    window.goHome = () => window.searchApp.goHome();
});
