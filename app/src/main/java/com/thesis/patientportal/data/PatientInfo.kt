package com.thesis.patientportal.data

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.google.gson.annotations.SerializedName

data class PatientInfo(
    val name: String?,
    val nid_no: String?,
    val gender: String?,
    val date_of_birth: String?,
    val address: String?,
    val blood_group: String?,
    val email: String?,
    val phone: String?,
    val father_name: String?
)

data class PatientInfoResponse(
    val message: String,
    @SerializedName("patient_info")
    val patient_info: Any? // Keep as Any to handle both string and object responses
) {
    fun getPatientInfo(): PatientInfo? {
        return when (patient_info) {
            is Map<*, *> -> {
                val info = patient_info as Map<String, String?>
                createPatientInfo(info)
            }
            is String -> {
                try {
                    // Try to parse the string as JSON using Gson
                    val jsonObject = Gson().fromJson(patient_info, JsonObject::class.java)
                    if (jsonObject != null) {
                        val info = mapOf(
                            "name" to jsonObject.get("name")?.asString,
                            "nid_no" to jsonObject.get("nid_no")?.asString,
                            "gender" to jsonObject.get("gender")?.asString,
                            "date_of_birth" to jsonObject.get("date_of_birth")?.asString,
                            "address" to jsonObject.get("address")?.asString,
                            "blood_group" to jsonObject.get("blood_group")?.asString,
                            "email" to jsonObject.get("email")?.asString,
                            "phone" to jsonObject.get("phone")?.asString,
                            "father_name" to jsonObject.get("father_name")?.asString
                        )
                        createPatientInfo(info)
                    } else {
                        // If parsing returns null, treat it as a plain NID string
                        createNidOnlyPatientInfo(patient_info)
                    }
                } catch (e: Exception) {
                    // If parsing fails, treat it as a plain NID string
                    createNidOnlyPatientInfo(patient_info)
                }
            }
            else -> null
        }
    }

    private fun createPatientInfo(info: Map<String, String?>): PatientInfo {
        return PatientInfo(
            name = info["name"],
            nid_no = info["nid_no"],
            gender = info["gender"],
            date_of_birth = info["date_of_birth"],
            address = info["address"],
            blood_group = info["blood_group"],
            email = info["email"],
            phone = info["phone"],
            father_name = info["father_name"]
        )
    }

    private fun createNidOnlyPatientInfo(nid: String): PatientInfo {
        return PatientInfo(
            name = null,
            nid_no = nid,
            gender = null,
            date_of_birth = null,
            address = null,
            blood_group = null,
            email = null,
            phone = null,
            father_name = null
        )
    }
} 