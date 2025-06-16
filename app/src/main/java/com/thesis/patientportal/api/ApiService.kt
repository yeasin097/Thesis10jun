package com.thesis.patientportal.api

import com.google.gson.annotations.SerializedName
import com.thesis.patientportal.data.PatientInfoResponse
import com.thesis.patientportal.data.EhrResponse
import com.thesis.patientportal.data.Doctor
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

    @GET("doctor/speciality/{specialty}")
    suspend fun searchDoctorsBySpecialty(@Path("specialty") specialty: String): Response<List<Doctor>>

    @GET("patient/permission/requests/{patientNid}")
    suspend fun getPermissionRequests(
        @Path("patientNid") patientNid: String
    ): PermissionApiResponse

    @POST("patient/permission/request")
    suspend fun requestPermission(
        @Body request: PermissionApiRequest
    ): PermissionApiResponse

    @POST("patient/permission/update")
    suspend fun updatePermission(
        @Body request: UpdatePermissionApiRequest
    ): PermissionApiResponse
}

data class PermissionApiResponse(
    @SerializedName("permissions")
    val permissions: List<PermissionApiRequest>
)

data class PermissionApiRequest(
    @SerializedName("doctor_id")
    val doctorId: String,
    @SerializedName("patient_nid")
    val patientNid: String,
    @SerializedName("permission_given")
    val permissionGiven: Boolean,
    @SerializedName("request_date")
    val requestDate: String,
    @SerializedName("updated_date")
    val updatedDate: String? = null
)

data class UpdatePermissionApiRequest(
    @SerializedName("patient_nid")
    val patientNid: String,
    @SerializedName("doctor_id")
    val doctorId: String,
    @SerializedName("permission_given")
    val permissionGiven: Boolean
) 