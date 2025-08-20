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

// noinspection JSUnusedGlobalSymbols
class LWR {
    constructor(options = {}) {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeRouteChange = options.beforeRouteChange || null;
        this.afterRouteChange = options.afterRouteChange || null;
        this.notFoundHandler = options.notFound || this.defaultNotFoundHandler;
        this.baseUrl = options.baseUrl || '';

        this.handlePopState = this.handlePopState.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('popstate', this.handlePopState);
        document.addEventListener('click', this.handleLinkClick);
        this.handleRoute(window.location.pathname + window.location.search).then();
    }

    addRoute(path, handler, options = {}) {
        const route = {
            path,
            handler,
            name: options.name || null,
            beforeEnter: options.beforeEnter || null,
            meta: options.meta || {}
        };

        this.routes.set(path, route);
        return this;
    }

    addRoutes(routes) {
        routes.forEach(route => {
            this.addRoute(route.path, route.handler, route.options || {});
        });
        return this;
    }

    navigate(path, options = {}) {
        const {replace = false, state = null} = options;

        if(replace) {
            window.history.replaceState(state, '', this.baseUrl + path);
        } else {
            window.history.pushState(state, '', this.baseUrl + path);
        }

        this.handleRoute(path).then();
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    parseUrl(path) {
        const [pathname, search] = path.split('?');
        const params = {};
        const query = {};

        if(search) {
            const searchParams = new URLSearchParams(search);
            for(const [key, value] of searchParams) {
                query[key] = value;
            }
        }

        return {pathname, search: search || '', params, query};
    }

    matchRoute(path) {
        const {pathname, query} = this.parseUrl(path);

        if(this.routes.has(pathname)) {
            return {
                route: this.routes.get(pathname),
                params: {},
                query
            };
        }

        for(const [routePath, route] of this.routes) {
            const match = this.matchPattern(routePath, pathname);
            if(match) {
                return {
                    route,
                    params: match.params,
                    query
                };
            }
        }

        return null;
    }

    matchPattern(pattern, path) {
        const paramNames = [];
        const regexPattern = pattern.replace(/:([^/]+)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        const regex = new RegExp(`^${regexPattern}$`);
        const matches = path.match(regex);

        if(!matches) return null;

        const params = {};
        paramNames.forEach((name, index) => {
            params[name] = matches[index + 1];
        });

        return {params};
    }

    async handleRoute(path) {
        const match = this.matchRoute(path);

        if(!match) {
            this.notFoundHandler(path);
            return;
        }

        const {route, params, query} = match;
        const routeContext = {
            path,
            route: route.path,
            params,
            query,
            meta: route.meta,
            name: route.name
        };

        try {
            if(this.beforeRouteChange) {
                const shouldContinue = await this.beforeRouteChange(routeContext, this.currentRoute);
                if(shouldContinue === false) return;
            }

            if(route.beforeEnter) {
                const shouldContinue = await route.beforeEnter(routeContext);
                if(shouldContinue === false) return;
            }

            await route.handler(routeContext);

            this.currentRoute = routeContext;

            if(this.afterRouteChange) {
                this.afterRouteChange(routeContext);
            }

        } catch(error) {
            console.error('Route handler error:', error);
            this.handleError(error, routeContext);
        }
    }

    handlePopState(_event) {
        this.handleRoute(window.location.pathname + window.location.search).then();
    }

    handleLinkClick(event) {
        const link = event.target.closest('a[href]');

        if(!link) return;

        const href = link.getAttribute('href');

        if(href.startsWith('http') ||
            href.startsWith('//') ||
            href.startsWith('#') ||
            link.target === '_blank' ||
            link.hasAttribute('download')) {
            return;
        }

        if(link.dataset.router === 'false') {
            return;
        }

        event.preventDefault();
        this.navigate(href);
    }

    defaultNotFoundHandler(path) {
        console.warn(`Route not found: ${path}`);
    }

    handleError(error, routeContext) {
        console.error('Router error:', error, routeContext);
    }

    destroy() {
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleLinkClick);
    }

    url(name, params = {}, query = {}) {
        let targetRoute = null;
        let targetPath = null;

        for(const [path, route] of this.routes) {
            if(route.name === name) {
                targetRoute = route;
                targetPath = path;
                break;
            }
        }

        if(!targetRoute) {
            console.warn(`Route with name "${name}" not found`);
            return '#';
        }

        let url = targetPath;
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, value);
        });

        const queryString = new URLSearchParams(query).toString();
        if(queryString) {
            url += '?' + queryString;
        }

        return this.baseUrl + url;
    }
}

export default LWR;
