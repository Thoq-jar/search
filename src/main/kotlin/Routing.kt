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

package dev.thoq

import dev.thoq.api.search
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondRedirect("/static/index.html")
        }

        post("/api/search") {
            val searchQuery = call.queryParameters["query"] ?: ""
            if(searchQuery.isEmpty()) return@post call.respondText("""{"error": "Query is empty"}""")

            val searchResult = search(searchQuery)

            call.respondText(searchResult)
        }

        staticResources("/static", "static")
    }
}
