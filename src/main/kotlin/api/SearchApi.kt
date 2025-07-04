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
    val ranking: Int
)

@Serializable
data class SearchResponse(
    val results: List<SearchResult>
)

suspend fun search(query: String): String {
    val results = mutableListOf<SearchResult>()
    println("searching... $query")
    val keywords = arrayOf(
        "stackoverflow",
        "stack overflow",
        "reddit",
        "stack exchange",
        "stackexchange"
    )
    val lowKeywords = arrayOf(
        "ai",
        "artificial",
        "intelligence",
        "chatgpt",
        "chat gpt",
        "claude",
        "grok",
        "times"
    )
    
    val client = HttpClient(CIO) {
        engine {
            requestTimeout = 30000
        }
    }
    
    return try {
        kotlinx.coroutines.delay(1000)
        
        val response = client.request("https://html.duckduckgo.com/html/?q=${java.net.URLEncoder.encode(query, "UTF-8")}") {
            method = io.ktor.http.HttpMethod.Get
            userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
            header("Accept-Language", "en-US,en;q=0.5")
            header("Accept-Encoding", "gzip, deflate, br")
            header("DNT", "1")
            header("Connection", "keep-alive")
            header("Upgrade-Insecure-Requests", "1")
            header("Sec-Fetch-Dest", "document")
            header("Sec-Fetch-Mode", "navigate")
            header("Sec-Fetch-Site", "none")
            header("Cache-Control", "max-age=0")
        }

        println("Response status: ${response.status}")

        when (response.status.value) {
            200 -> {
                val responseText = response.body<String>()
                val document = Ksoup.parse(responseText)
                val resultSelector = ".result"

                document.select(resultSelector).forEach { result ->
                    var ranking = 0

                    fun checkKeywords(keywordList: Array<String>) {
                        keywordList.forEachIndexed { index, keyword ->
                            if(result.select(".result__title").text().contains(keyword, ignoreCase = true)) {
                                ranking = index + 3
                                return@forEachIndexed
                            }

                            if(result.select(".result__snippet").text().contains(keyword, ignoreCase = true)) {
                                ranking = index + 2
                                return@forEachIndexed
                            }
                        }
                    }

                    checkKeywords(keywords)
                    checkKeywords(lowKeywords)

                    results.add(
                        SearchResult(
                            title = result.select(".result__title").text(),
                            snippet = result.select(".result__snippet").text(),
                            url = result.select(".result__url").text(),
                            ranking = ranking
                        )
                    )
                }

                val sortedResults = results.sortedBy { it.ranking }
                Json.encodeToString(SearchResponse(sortedResults))
            }
            202 -> {
                """{"error": "Search service is temporarily unavailable. Please try again in a few moments."}"""
            }
            429 -> {
                """{"error": "Too many requests. Please wait before searching again."}"""
            }
            403 -> {
                """{"error": "Access denied by search service. Please try again later."}"""
            }
            else -> {
                """{"error": "Search service returned HTTP ${response.status.value}"}"""
            }
        }
        
    } catch (e: Exception) {
        println("Error during search: ${e.message}")
        e.printStackTrace()
        """{"error": "Search failed: ${e.message}"}"""
    } finally {
        client.close()
    }
}