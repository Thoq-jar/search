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
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/api/search") {
            val searchQuery = call.queryParameters["query"] ?: ""
            if(searchQuery.isEmpty()) {
                call.respondText(
                    """{"error": "Query is empty"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.BadRequest
                )
                return@get
            }

            try {
                val searchResult = search(searchQuery)
                call.respondText(
                    searchResult,
                    ContentType.Application.Json,
                    HttpStatusCode.OK
                )
            } catch (e: Exception) {
                println("Route error: ${e.message}")
                e.printStackTrace()
                call.respondText(
                    """{"error": "Internal server error"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        staticResources("/", "static")
    }
}
