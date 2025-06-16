package com.thesis.patientportal.data

import com.google.gson.annotations.SerializedName

data class Doctor(
    @SerializedName("doctorID")
    val id: String,
    @SerializedName("doctorName")
    val name: String,
    @SerializedName("speciality")
    val specialty: String,
    val address: String,
    val hospital: String
) 