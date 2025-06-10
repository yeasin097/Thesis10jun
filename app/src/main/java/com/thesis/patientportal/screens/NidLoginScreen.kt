package com.thesis.patientportal.screens

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.thesis.patientportal.api.NetworkModule
import com.thesis.patientportal.data.PatientInfo
import kotlinx.coroutines.launch
import android.widget.Toast

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NidLoginScreen(
    onLoginSuccess: (PatientInfo) -> Unit,
    onBack: () -> Unit
) {
    var nid by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "NID Login",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        OutlinedTextField(
            value = nid,
            onValueChange = { nid = it },
            label = { Text("NID Number") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            singleLine = true,
            enabled = !isLoading
        )

        if (error != null) {
            Text(
                text = error!!,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = onBack,
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp),
                enabled = !isLoading
            ) {
                Text("Back")
            }

            Button(
                onClick = {
                    if (nid.isNotBlank()) {
                        scope.launch {
                            try {
                                isLoading = true
                                error = null
                                Log.d("NidLoginScreen", "Making API call with NID: $nid")
                                val response = NetworkModule.apiService.loginWithNid(
                                    mapOf("nid_no" to nid)
                                )
                                Log.d("NidLoginScreen", "API response received: ${response.code()}")
                                if (response.isSuccessful) {
                                    response.body()?.getPatientInfo()?.let { patientInfo ->
                                        Log.d("NidLoginScreen", "Login successful for NID: ${patientInfo.nid_no}")
                                        onLoginSuccess(patientInfo)
                                    } ?: run {
                                        Log.e("NidLoginScreen", "Invalid response body")
                                        error = "Invalid response from server"
                                    }
                                } else {
                                    val errorBody = response.errorBody()?.string()
                                    Log.e("NidLoginScreen", "Login failed: $errorBody")
                                    error = errorBody ?: "Login failed"
                                }
                            } catch (e: Exception) {
                                Log.e("NidLoginScreen", "Exception during login", e)
                                error = e.message ?: "An error occurred"
                            } finally {
                                isLoading = false
                            }
                        }
                    } else {
                        error = "Please enter NID number"
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Login")
                }
            }
        }
    }
} 