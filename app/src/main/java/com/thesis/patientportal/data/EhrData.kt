package com.thesis.patientportal.data

import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.annotations.SerializedName

data class EhrData(
    val ehr_id: String,
    val patient_id: String?,
    val doctor_id: String?,
    val hospital_id: String?,
    @SerializedName("details")
    private val _details: Any?,  // Can be either String or JsonObject
    val cid: String?
) {
    // Parse details immediately when accessed
    val details: EhrDetails?
        get() = try {
            when (_details) {
                is String -> {
                    Log.d("EhrData", "Parsing details from string: $_details")
                    Gson().fromJson(_details, EhrDetails::class.java)
                }
                is JsonObject -> {
                    Log.d("EhrData", "Parsing details from JsonObject: $_details")
                    Gson().fromJson(_details, EhrDetails::class.java)
                }
                else -> {
                    Log.d("EhrData", "Details is neither String nor JsonObject: ${_details?.javaClass?.name}")
                    null
                }
            }
        } catch (e: Exception) {
            Log.e("EhrData", "Error parsing details: ${e.message}", e)
            null
        }
}

data class EhrDetails(
    val visit_date: String?,
    val address: String?,
    val blood_group: String?,
    val date_of_birth: String?,
    val gender: String?,
    val diagnosis: String?,
    val medications: List<String>?,  // Will handle both flat and nested arrays
    val test_results: TestResults?,
    val notes: String?
)

data class TestResults(
    val blood_pressure: String?,
    val allergy: String?,
    val cholesterol: String?
)

data class EhrResponse(
    val message: String,
    @SerializedName("ehrs")
    val ehrs: List<EhrData>
) 