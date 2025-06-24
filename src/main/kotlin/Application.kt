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

import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureHTTP()
    configureSecurity()
    configureSerialization()
    configureTemplating()
    configureRouting()
}
