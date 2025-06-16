package com.thesis.patientportal.screens

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.thesis.patientportal.api.PermissionApiRequest
import com.thesis.patientportal.api.UpdatePermissionApiRequest
import com.thesis.patientportal.api.NetworkModule
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PermissionsScreen(
    patientNid: String,
    onBack: () -> Unit
) {
    var permissionRequests by remember { mutableStateOf<List<PermissionApiRequest>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val apiService = remember { NetworkModule.apiService }

    // Function to refresh permission requests
    fun refreshPermissions() {
        scope.launch {
            isLoading = true
            try {
                val response = apiService.getPermissionRequests(patientNid)
                Log.d("PermissionsScreen", "API Response: $response")
                Log.d("PermissionsScreen", "Permissions list: ${response.permissions}")
                
                // Filter out any invalid requests and log them
                permissionRequests = response.permissions.filter { request ->
                    val isValid = request.doctorId != null && request.requestDate != null
                    if (!isValid) {
                        Log.w("PermissionsScreen", "Invalid permission request: $request")
                    }
                    isValid
                }
                
                if (permissionRequests.isEmpty()) {
                    Log.d("PermissionsScreen", "No valid permission requests found")
                }
                
                error = null
            } catch (e: Exception) {
                Log.e("PermissionsScreen", "Error fetching permissions", e)
                error = "Failed to load permission requests: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    // Fetch permission requests when the screen is launched
    LaunchedEffect(patientNid) {
        refreshPermissions()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Access Permissions") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Pending Requests Section
            Text(
                text = "Pending Requests",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                modifier = Modifier.padding(16.dp)
            )

            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (error != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = error!!,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            } else if (permissionRequests.filter { !it.permissionGiven }.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No pending permission requests",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(permissionRequests.filter { !it.permissionGiven }) { request ->
                        PermissionRequestCard(
                            request = request,
                            onApprove = {
                                scope.launch {
                                    try {
                                        apiService.updatePermission(
                                            UpdatePermissionApiRequest(
                                                patientNid = request.patientNid,
                                                doctorId = request.doctorId,
                                                permissionGiven = true
                                            )
                                        )
                                        // Refresh the permissions list after approval
                                        refreshPermissions()
                                    } catch (e: Exception) {
                                        error = "Failed to approve permission: ${e.message}"
                                    }
                                }
                            },
                            onReject = {
                                scope.launch {
                                    try {
                                        apiService.updatePermission(
                                            UpdatePermissionApiRequest(
                                                patientNid = request.patientNid,
                                                doctorId = request.doctorId,
                                                permissionGiven = false
                                            )
                                        )
                                        // Refresh the permissions list after rejection
                                        refreshPermissions()
                                    } catch (e: Exception) {
                                        error = "Failed to reject permission: ${e.message}"
                                    }
                                }
                            }
                        )
                    }
                }
            }

            Divider(modifier = Modifier.padding(vertical = 16.dp))

            // Approved Permissions Section
            Text(
                text = "Approved Permissions",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                modifier = Modifier.padding(16.dp)
            )

            if (permissionRequests.filter { it.permissionGiven }.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No approved permissions",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(permissionRequests.filter { it.permissionGiven }) { request ->
                        ApprovedPermissionCard(
                            request = request,
                            onRevoke = {
                                scope.launch {
                                    try {
                                        apiService.updatePermission(
                                            UpdatePermissionApiRequest(
                                                patientNid = request.patientNid,
                                                doctorId = request.doctorId,
                                                permissionGiven = false
                                            )
                                        )
                                        // Refresh the permissions list after revocation
                                        refreshPermissions()
                                    } catch (e: Exception) {
                                        error = "Failed to revoke permission: ${e.message}"
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PermissionRequestCard(
    request: PermissionApiRequest,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    // Add null checks and default values
    val doctorId = request.doctorId ?: "Unknown Doctor"
    val requestDate = request.requestDate ?: "Unknown Date"
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Doctor ID: $doctorId",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold
                )
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Requested on: ${formatDate(requestDate)}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(
                    onClick = onReject,
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Reject")
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Reject")
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = onApprove,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(Icons.Default.Check, contentDescription = "Approve")
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Approve")
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ApprovedPermissionCard(
    request: PermissionApiRequest,
    onRevoke: () -> Unit
) {
    // Add null checks and default values
    val doctorId = request.doctorId ?: "Unknown Doctor"
    val displayDate = request.updatedDate ?: request.requestDate ?: "Unknown Date"
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Doctor ID: $doctorId",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold
                    )
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Approved on: ${formatDate(displayDate)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Button(
                onClick = onRevoke,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Icon(Icons.Default.Close, contentDescription = "Revoke Access")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Revoke")
            }
        }
    }
}

private fun formatDate(dateString: String): String {
    return try {
        if (dateString == "Unknown Date") return dateString
        
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val outputFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
        val date = inputFormat.parse(dateString)
        date?.let { outputFormat.format(it) } ?: dateString
    } catch (e: Exception) {
        Log.e("PermissionsScreen", "Error formatting date: $dateString", e)
        dateString
    }
} 