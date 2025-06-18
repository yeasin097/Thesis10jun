package com.thesis.patientportal.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    private var baseUrl = "http://192.168.1.104:8000/"  // Default URL
    private var retrofit: Retrofit? = null
    private var _apiService: ApiService? = null

    private val loggingInterceptor = HttpLoggingInterceptor { message ->
        android.util.Log.d("NetworkModule", "Response: $message")
    }.apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private fun createRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun updateBaseUrl(newBaseUrl: String) {
        baseUrl = newBaseUrl
        retrofit = createRetrofit()
        _apiService = retrofit?.create(ApiService::class.java)
    }

    val apiService: ApiService
        get() {
            if (_apiService == null) {
                retrofit = createRetrofit()
                _apiService = retrofit?.create(ApiService::class.java)
            }
            return _apiService!!
        }
} 