package com.thesis.patientportal.api

import com.thesis.patientportal.data.PatientInfoResponse
import com.thesis.patientportal.data.EhrResponse
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("patient/find")
    suspend fun loginWithNid(
        @Body request: Map<String, String>
    ): Response<PatientInfoResponse>

    @Multipart
    @POST("patient/find")
    suspend fun loginWithBiometric(
        @Part fingerprint: MultipartBody.Part
    ): Response<PatientInfoResponse>

    @POST("patient/ehrs")
    suspend fun getPatientEhrs(
        @Body request: Map<String, String>
    ): Response<EhrResponse>
} 