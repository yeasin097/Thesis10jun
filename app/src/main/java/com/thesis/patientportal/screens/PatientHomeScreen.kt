package com.thesis.patientportal.screens

import android.content.Context
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Environment
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thesis.patientportal.api.NetworkModule
import com.thesis.patientportal.data.EhrData
import com.thesis.patientportal.data.PatientInfo
import java.io.File
import java.io.FileOutputStream
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientHomeScreen(
    patientInfo: PatientInfo? = null,
    onLogout: () -> Unit,
    onSearchDoctor: () -> Unit,
    onViewEhrs: () -> Unit,
    onViewPermissions: () -> Unit
) {
    var patientInfoState by remember { mutableStateOf(patientInfo) }
    var isLoadingState by remember { mutableStateOf(false) }
    var errorState by remember { mutableStateOf<String?>(null) }
    var ehrData by remember { mutableStateOf<List<EhrData>>(emptyList()) }
    var isLoadingEhrs by remember { mutableStateOf(false) }
    var errorEhrs by remember { mutableStateOf<String?>(null) }
    var showEhrs by remember { mutableStateOf(false) }
    var showPermissions by remember { mutableStateOf(false) }
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
                isLoadingState = true // Set loading state when image picked
                errorState = null // Clear previous error
                uploadFingerprint(it, context) { info, error ->
                    patientInfoState = info
                    errorState = error
                    isLoadingState = false // Clear loading state
                }
            }
        }
    }

    fun fetchEhrs() {
        scope.launch {
            try {
                isLoadingEhrs = true
                errorEhrs = null
                val response = NetworkModule.apiService.getPatientEhrs(
                    mapOf("nid_no" to (patientInfoState?.nid_no ?: ""))
                )
                if (response.isSuccessful) {
                    ehrData = response.body()?.ehrs ?: emptyList()
                } else {
                    errorEhrs = "Failed to fetch medical records: ${response.message()}"
                }
            } catch (e: Exception) {
                errorEhrs = "Error: ${e.message}"
            } finally {
                isLoadingEhrs = false
            }
        }
    }

    fun downloadEhrAsPdf(ehr: EhrData) {
        try {
            val pdfDocument = PdfDocument()
            val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 size
            val page = pdfDocument.startPage(pageInfo)
            val canvas = page.canvas
            val paint = Paint().apply {
                color = Color.BLACK
                textSize = 12f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL) // Ensure normal typeface for content
            }

            var yPosition = 50f
            val margin = 50f
            val lineHeight = 20f

            // Title
            paint.apply {
                textSize = 24f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            }
            canvas.drawText("Electronic Health Record", margin, yPosition, paint)

            // Reset paint for normal text
            paint.apply {
                textSize = 12f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
            }
            yPosition += lineHeight * 2

            // EHR Details
            fun drawText(text: String) {
                canvas.drawText(text, margin, yPosition, paint)
                yPosition += lineHeight
            }

            drawText("EHR ID: ${ehr.ehr_id}")
            drawText("Visit Date: ${ehr.details?.visit_date ?: "N/A"}")
            drawText("Diagnosis: ${ehr.details?.diagnosis ?: "N/A"}")

            drawText("Medications:")
            ehr.details?.medications?.forEach { med ->
                drawText("• $med")
            }

            drawText("Test Results:")
            ehr.details?.test_results?.let { results ->
                drawText("Blood Pressure: ${results.blood_pressure ?: "N/A"}")
                drawText("Allergy: ${results.allergy ?: "N/A"}")
                drawText("Cholesterol: ${results.cholesterol ?: "N/A"}")
            }

            drawText("Notes: ${ehr.details?.notes ?: "N/A"}")

            pdfDocument.finishPage(page)

            val fileName = "EHR_${ehr.ehr_id}_${System.currentTimeMillis()}.pdf"
            val filePath = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)

            try {
                FileOutputStream(filePath).use { out ->
                    pdfDocument.writeTo(out)
                }
                Toast.makeText(context, "EHR downloaded to ${filePath.absolutePath}", Toast.LENGTH_LONG).show()
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to save PDF: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                pdfDocument.close()
            }
        } catch (e: Exception) {
            Toast.makeText(context, "Failed to generate PDF: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Patient Portal",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp
                        )
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                modifier = Modifier.shadow(8.dp)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Fingerprint login option
            if (patientInfo == null && patientInfoState == null) { // Show only if not already logged in
                Button(
                    onClick = { imagePicker.launch("image/*") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                ) {
                    Text("Login with Fingerprint")
                }
            }

            when {
                isLoadingState -> {
                    LoadingIndicator()
                }
                errorState != null -> {
                    ErrorCard(errorState!!)
                }
                patientInfoState != null -> {
                    PatientInfoCard(patientInfoState!!)

                    // Action Buttons
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        ActionButton(
                            onClick = onViewEhrs,
                            textLine1 = "View",
                            textLine2 = "EHRs",
                            containerColor = MaterialTheme.colorScheme.primary,
                            icon = "📋"
                        )

                        ActionButton(
                            onClick = onSearchDoctor,
                            textLine1 = "Search",
                            textLine2 = "Doctor",
                            containerColor = MaterialTheme.colorScheme.primary,
                            icon = "👨‍⚕️"
                        )

                        ActionButton(
                            onClick = onViewPermissions,
                            textLine1 = "Access",
                            textLine2 = "Control",
                            containerColor = MaterialTheme.colorScheme.primary,
                            icon = "🔒"
                        )

                        ActionButton(
                            onClick = onLogout,
                            textLine1 = "Log",
                            textLine2 = "Out",
                            containerColor = MaterialTheme.colorScheme.error,
                            icon = "🚪"
                        )
                    }

                    // Content Area
                    when {
                        showEhrs -> {
                            EhrContent(
                                isLoadingEhrs = isLoadingEhrs,
                                errorEhrs = errorEhrs,
                                ehrData = ehrData,
                                onDownloadPdf = { ehr -> downloadEhrAsPdf(ehr) }
                            )
                        }
                        showPermissions -> {
                            PermissionsContent()
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
            .padding(16.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.primary,
                                MaterialTheme.colorScheme.primaryContainer
                            )
                        )
                    ),
                color = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Text(
                    text = "Patient Information",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Bold
                    ),
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
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Text(
            text = "$label:",
            style = MaterialTheme.typography.bodyLarge.copy(
                fontWeight = FontWeight.Medium
            ),
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
private fun EhrContent(
    isLoadingEhrs: Boolean,
    errorEhrs: String?,
    ehrData: List<EhrData>,
    onDownloadPdf: (EhrData) -> Unit
) {
    when {
        isLoadingEhrs -> {
            LoadingIndicator()
        }
        errorEhrs != null -> {
            ErrorCard(errorEhrs)
        }
        ehrData.isEmpty() -> {
            EmptyStateCard("No medical records found")
        }
        else -> {
            EhrListContent(ehrData, onDownloadPdf)
        }
    }
}

@Composable
private fun EhrCard(ehr: EhrData, onDownloadPdf: (EhrData) -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
        ) {
            // Visit Date Header
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.secondaryContainer),
                color = MaterialTheme.colorScheme.secondaryContainer,
                contentColor = MaterialTheme.colorScheme.onSecondaryContainer
            ) {
                Text(
                    text = "Visit Date: ${ehr.details?.visit_date ?: "N/A"}",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    modifier = Modifier.padding(16.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Content sections with improved styling
            SectionContent("Diagnosis", ehr.details?.diagnosis)
            SectionContent("Medications", ehr.details?.medications?.joinToString("\n"))
            SectionContent("Test Results", formatTestResults(ehr.details?.test_results))
            SectionContent("Notes", ehr.details?.notes)

            Spacer(modifier = Modifier.height(16.dp))

            // Download PDF Button with improved styling
            Button(
                onClick = { onDownloadPdf(ehr) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondary
                ),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 4.dp,
                    pressedElevation = 8.dp
                )
            ) {
                Text(
                    "Download as PDF",
                    style = MaterialTheme.typography.titleMedium
                )
            }
        }
    }
}

@Composable
private fun SectionContent(title: String, content: String?) {
    if (!content.isNullOrEmpty()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                ),
                modifier = Modifier.padding(bottom = 8.dp)
            )
            Text(
                text = content,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                    .padding(16.dp)
            )
        }
    }
}

@Composable
private fun LoadingIndicator() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(48.dp),
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 4.dp
        )
    }
}

@Composable
private fun ErrorCard(message: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer
        )
    ) {
        Text(
            text = message,
            color = MaterialTheme.colorScheme.onErrorContainer,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(24.dp)
        )
    }
}

@Composable
private fun EmptyStateCard(message: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp)
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(32.dp)
        )
    }
}

@Composable
private fun PermissionsContent() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                "Permission Requests",
                style = MaterialTheme.typography.headlineSmall.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            PermissionRequestItem(
                "Dr. John Smith",
                "City Hospital",
                "Requesting access to your medical records"
            )
            Divider(
                modifier = Modifier.padding(vertical = 16.dp),
                color = MaterialTheme.colorScheme.outlineVariant
            )
            PermissionRequestItem(
                "Dr. Sarah Johnson",
                "General Hospital",
                "Requesting access to your test results"
            )
        }
    }
}

@Composable
private fun PermissionRequestItem(
    doctorName: String,
    hospitalName: String,
    requestType: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = doctorName,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = hospitalName,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 4.dp)
            )
            Text(
                text = requestType,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = { /* TODO: Handle reject */ },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Reject")
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = { /* TODO: Handle approve */ },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Approve")
                }
            }
        }
    }
}

private fun formatTestResults(results: com.thesis.patientportal.data.TestResults?): String {
    if (results == null) return ""
    return buildString {
        results.blood_pressure?.let { append("Blood Pressure: $it\n") }
        results.allergy?.let { append("Allergy: $it\n") }
        results.cholesterol?.let { append("Cholesterol: $it") }
    }.trim()
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
            // Provide a more specific error message from the API if available
            val errorBody = response.errorBody()?.string()
            val errorMessage = if (!errorBody.isNullOrBlank()) {
                "Failed to verify fingerprint: $errorBody"
            } else {
                "Failed to verify fingerprint: ${response.message()}"
            }
            onComplete(null, errorMessage)
        }
    } catch (e: Exception) {
        onComplete(null, "Error uploading fingerprint: ${e.message}")
    }
}

@Composable
private fun ActionButton(
    onClick: () -> Unit,
    textLine1: String,
    textLine2: String,
    containerColor: androidx.compose.ui.graphics.Color,
    icon: String
) {
    Surface(
        modifier = Modifier
            .size(110.dp)
            .padding(4.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(8.dp)
            ),
        shape = RoundedCornerShape(8.dp),
        color = containerColor,
        onClick = onClick
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp)
        ) {
            Text(
                text = icon,
                style = MaterialTheme.typography.headlineMedium,
                fontSize = 20.sp,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            Text(
                text = textLine1,
                style = MaterialTheme.typography.titleSmall,
                textAlign = TextAlign.Center,
                maxLines = 1,
                color = MaterialTheme.colorScheme.onPrimary
            )
            Text(
                text = textLine2,
                style = MaterialTheme.typography.titleSmall,
                textAlign = TextAlign.Center,
                maxLines = 1,
                color = MaterialTheme.colorScheme.onPrimary
            )
        }
    }
}

@Composable
private fun EhrListContent(ehrs: List<EhrData>, onDownloadPdf: (EhrData) -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Medical Records",
            style = MaterialTheme.typography.headlineMedium.copy(
                fontWeight = FontWeight.Bold
            ),
            modifier = Modifier.padding(bottom = 24.dp)
        )

        ehrs.forEachIndexed { index, ehr ->
            EhrCard(ehr, onDownloadPdf)
            if (index < ehrs.size - 1) {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}