package com.thesis.patientportal.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    // For Android Emulator, use 10.0.2.2 to access host machine's localhost
    private const val BASE_URL = "http://172.22.205.76:8000/"  // Android Emulator
    // For physical device, use your computer's IP address on the same network
    // Example: "http://192.168.1.100:8000/"

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

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
} 