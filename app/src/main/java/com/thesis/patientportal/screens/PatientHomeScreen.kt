package com.thesis.patientportal.screens

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.thesis.patientportal.api.NetworkModule
import com.thesis.patientportal.data.PatientInfo
import com.thesis.patientportal.data.EhrData
import kotlinx.coroutines.launch
import android.widget.Toast
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientHomeScreen(
    patientInfo: PatientInfo? = null,
    onLogout: () -> Unit
) {
    var patientInfoState by remember { mutableStateOf(patientInfo) }
    var isLoadingState by remember { mutableStateOf(false) }
    var errorState by remember { mutableStateOf<String?>(null) }
    var ehrData by remember { mutableStateOf<List<EhrData>>(emptyList()) }
    var isLoadingEhrs by remember { mutableStateOf(false) }
    var errorEhrs by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    // Fingerprint image picker
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedImageUri = uri
        uri?.let {
            scope.launch {
                uploadFingerprint(it, context) { info, error ->
                    patientInfoState = info
                    errorState = error
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Patient Portal",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Bold
                        )
                    ) 
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                actions = {
                    IconButton(onClick = onLogout) {
                        Icon(
                            Icons.Default.ExitToApp,
                            contentDescription = "Logout",
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Fingerprint login option
            if (patientInfo == null) {
                Button(
                    onClick = { imagePicker.launch("image/*") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                ) {
                    Icon(Icons.Default.Person, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Login with Fingerprint")
                }
            }

            when {
                isLoadingState -> {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.padding(32.dp),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                errorState != null -> {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        )
                    ) {
                        Text(
                            text = errorState ?: "",
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
                patientInfoState != null -> {
                    PatientInfoCard(patientInfoState!!)

                    // EHR Button
                    Button(
                        onClick = {
                            scope.launch {
                                try {
                                    isLoadingEhrs = true
                                    errorEhrs = null
                                    android.util.Log.d("PatientHomeScreen", "Fetching EHRs for NID: ${patientInfoState?.nid_no}")
                                    
                                    val response = NetworkModule.apiService.getPatientEhrs(
                                        mapOf("nid_no" to (patientInfoState?.nid_no ?: ""))
                                    )
                                    
                                    android.util.Log.d("PatientHomeScreen", "API Response Code: ${response.code()}")
                                    android.util.Log.d("PatientHomeScreen", "Raw API Response: ${response.body()?.toString()}")
                                    
                                    if (response.isSuccessful) {
                                        val ehrs = response.body()?.ehrs ?: emptyList()
                                        android.util.Log.d("PatientHomeScreen", "Parsed ${ehrs.size} EHRs")
                                        ehrs.forEachIndexed { index, ehr ->
                                            android.util.Log.d("PatientHomeScreen", """
                                                EHR $index Details:
                                                - ID: ${ehr.ehr_id}
                                                - Details: ${ehr.details}
                                                - Visit Date: ${ehr.details?.visit_date}
                                                - Diagnosis: ${ehr.details?.diagnosis}
                                                - Medications: ${ehr.details?.medications}
                                                - Test Results: ${ehr.details?.test_results}
                                                - Notes: ${ehr.details?.notes}
                                            """.trimIndent())
                                        }
                                        ehrData = ehrs
                                    } else {
                                        val errorBody = response.errorBody()?.string()
                                        android.util.Log.e("PatientHomeScreen", "Failed to fetch EHRs: ${response.message()}, body: $errorBody")
                                        errorEhrs = "Failed to fetch EHRs: ${response.message()}"
                                    }
                                } catch (e: Exception) {
                                    android.util.Log.e("PatientHomeScreen", "Error fetching EHRs", e)
                                    errorEhrs = "Error: ${e.message}"
                                } finally {
                                    isLoadingEhrs = false
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp)
                            .height(56.dp),
                        enabled = !isLoadingEhrs,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondary,
                            contentColor = MaterialTheme.colorScheme.onSecondary
                        )
                    ) {
                        Text(
                            "View Medical Records",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }

                    // EHR Display
                    when {
                        isLoadingEhrs -> {
                            CircularProgressIndicator(
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                        errorEhrs != null -> {
                            Text(
                                text = errorEhrs ?: "",
                                color = MaterialTheme.colorScheme.error,
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                        ehrData.isNotEmpty() -> {
                            android.util.Log.d("PatientHomeScreen", "Rendering EhrList with ${ehrData.size} EHRs")
                            EhrList(ehrData)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PatientInfoCard(patient: PatientInfo) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Text(
                    text = "Patient Information",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(24.dp)
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                InfoRow("Name", patient.name)
                InfoRow("Father's Name", patient.father_name)
                InfoRow("Gender", patient.gender)
                InfoRow("Date of Birth", patient.date_of_birth)
                InfoRow("Address", patient.address)
                InfoRow("Blood Group", patient.blood_group)
                InfoRow("Email", patient.email)
                InfoRow("Phone", patient.phone)
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = "$label:",
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(0.4f)
        )
        Text(
            text = value ?: "N/A",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(0.6f)
        )
    }
}

@Composable
private fun EhrList(ehrs: List<EhrData>) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Medical Records",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        ehrs.forEachIndexed { index, ehr ->
            EhrCard(ehr)
            if (index < ehrs.size - 1) {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun EhrCard(ehr: EhrData) {
    val details = ehr.details
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
        ) {
            // Visit Date Header
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.secondaryContainer,
                contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                shape = MaterialTheme.shapes.medium
            ) {
                Text(
                    text = "Visit Date: ${details?.visit_date ?: "N/A"}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(16.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Diagnosis Section
            SectionHeader("Diagnosis")
            Text(
                text = details?.diagnosis ?: "N/A",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(start = 16.dp, top = 8.dp, bottom = 16.dp)
            )

            // Medications Section
            SectionHeader("Medications")
            Column(modifier = Modifier.padding(start = 16.dp, top = 8.dp, bottom = 16.dp)) {
                if (!details?.medications.isNullOrEmpty()) {
                    details.medications.forEach { medication ->
                        when (medication) {
                            is String -> MedicationItem(medication)
                            is List<*> -> {
                                medication.forEach { subMed ->
                                    if (subMed is String) {
                                        MedicationItem(subMed)
                                    }
                                }
                            }
                        }
                    }
                } else {
                    Text(
                        text = "No medications listed",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Test Results Section
            SectionHeader("Test Results")
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    InfoRow("Blood Pressure", details?.test_results?.blood_pressure ?: "N/A")
                    InfoRow("Allergy", details?.test_results?.allergy ?: "N/A")
                    InfoRow("Cholesterol", details?.test_results?.cholesterol ?: "N/A")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Notes Section
            SectionHeader("Notes")
            Text(
                text = details?.notes ?: "N/A",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(start = 16.dp, top = 8.dp)
            )
        }
    }
}

@Composable
private fun SectionHeader(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary
    )
}

@Composable
private fun MedicationItem(medication: String) {
    Row(
        modifier = Modifier.padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            modifier = Modifier.size(8.dp),
            shape = MaterialTheme.shapes.small,
            color = MaterialTheme.colorScheme.primary
        ) {}
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = medication,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

private suspend fun uploadFingerprint(
    uri: Uri,
    context: Context,
    onComplete: (PatientInfo?, String?) -> Unit
) {
    try {
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
            onComplete(response.body()?.getPatientInfo(), null)
        } else {
            onComplete(null, "Failed to verify fingerprint: ${response.message()}")
        }
    } catch (e: Exception) {
        onComplete(null, "Error: ${e.message}")
    }
}