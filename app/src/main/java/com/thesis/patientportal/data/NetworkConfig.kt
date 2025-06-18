package com.thesis.patientportal.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.thesis.patientportal.api.NetworkModule

object NetworkConfig {
    private const val PREFS_NAME = "network_config"
    private const val KEY_HOST_IP = "host_ip"
    private const val DEFAULT_IP = "192.168.1.102"

    private lateinit var prefs: SharedPreferences

    fun initialize(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun getHostIp(): String {
        return prefs.getString(KEY_HOST_IP, DEFAULT_IP) ?: DEFAULT_IP
    }

    fun updateHostIp(context: Context, newIp: String) {
        try {
            // Update SharedPreferences
            prefs.edit().putString(KEY_HOST_IP, newIp).apply()

            // Update NetworkModule
            NetworkModule.updateBaseUrl("http://$newIp:8000/")

            Log.d("NetworkConfig", "Successfully updated host IP to: $newIp")
        } catch (e: Exception) {
            Log.e("NetworkConfig", "Failed to update host IP", e)
            throw e
        }
    }
} 