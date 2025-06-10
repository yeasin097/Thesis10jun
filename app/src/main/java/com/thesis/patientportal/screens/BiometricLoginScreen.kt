package com.thesis.patientportal.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BiometricLoginScreen(
    onLoginSuccess: (PatientInfo) -> Unit,
    onBack: () -> Unit
) {
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedImageUri = uri
        if (uri == null) {
            error = "No image selected"
        } else {
            scope.launch {
                try {
                    isLoading = true
                    error = null
                    
                    val inputStream = context.contentResolver.openInputStream(uri)
                    val file = File.createTempFile("fingerprint", ".jpg", context.cacheDir)
                    inputStream?.use { input ->
                        file.outputStream().use { output ->
                            input.copyTo(output)
                        }
                    }

                    val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                    val fingerprintPart = MultipartBody.Part.createFormData("fingerprint", file.name, requestFile)

                    val response = NetworkModule.apiService.loginWithBiometric(fingerprintPart)
                    if (response.isSuccessful) {
                        response.body()?.getPatientInfo()?.let { patientInfo ->
                            onLoginSuccess(patientInfo)
                        } ?: run {
                            error = "Invalid response from server"
                        }
                    } else {
                        error = response.errorBody()?.string() ?: "Failed to verify fingerprint"
                    }
                } catch (e: Exception) {
                    error = e.message ?: "An error occurred"
                } finally {
                    isLoading = false
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Biometric Login",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        if (selectedImageUri != null) {
            Text(
                text = "Image selected",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

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
                onClick = { imagePicker.launch("image/*") },
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
                    Text(if (selectedImageUri == null) "Select Image" else "Change Image")
                }
            }
        }
    }
} 