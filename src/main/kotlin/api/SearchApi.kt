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

package dev.thoq.api

import io.ktor.client.*
import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.client.engine.cio.*
import com.fleeksoft.ksoup.Ksoup
import io.ktor.http.userAgent
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class SearchResult(
    val title: String,
    val snippet: String,
    val url: String,
)

@Serializable
data class SearchResponse(
    val results: List<SearchResult>
)

suspend fun search(query: String): String {
    val results = mutableListOf<SearchResult>()

    val client = HttpClient(CIO)
    val response = client.request("https://html.duckduckgo.com/html/?q=$query") {
        method = io.ktor.http.HttpMethod.Get
        userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:139.0) Gecko/20100101 Firefox/139.0")
    }

    if(response.status.value != 200) return """{"error": "HTTP ${response.status}"}"""

    val responseText = response.body<String>()
    val document = Ksoup.parse(responseText)
    val resultSelector = ".result"

    document.select(resultSelector).forEach { result ->
        results.add(SearchResult(
            title = result.select(".result__title").text(),
            snippet = result.select(".result__snippet").text(),
            url = result.select(".result__url").text()
        ))
    }

    return Json.encodeToString(SearchResponse(results))
}