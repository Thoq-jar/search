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

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cachingheaders.*
import io.ktor.server.plugins.compression.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.hsts.*
import io.ktor.server.plugins.partialcontent.*

fun Application.configureHTTP() {
    install(CachingHeaders) {
        options { _, outgoingContent ->
            when (outgoingContent.contentType?.withoutParameters()) {
                ContentType.Text.CSS -> CachingOptions(CacheControl.NoCache(null))
                ContentType.Text.JavaScript -> CachingOptions(CacheControl.NoCache(null))
                ContentType.Text.Html -> CachingOptions(CacheControl.NoCache(null))
                else -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 24 * 60 * 60))
            }
        }
    }
    install(Compression)
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.Authorization)
        // this is ok because this is an open-source project,
        // if you are deploying this, you may want to change this
        anyHost()
    }
    install(DefaultHeaders) {
        header("X-Engine", "Ktor")
    }
    install(HSTS) {
        includeSubDomains = true
    }
    install(PartialContent) {
        maxRangeCount = 10
    }
}
