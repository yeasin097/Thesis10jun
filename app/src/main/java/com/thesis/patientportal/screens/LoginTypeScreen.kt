package com.thesis.patientportal.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.thesis.patientportal.data.NetworkConfig

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginTypeScreen(
    onNidLoginSelected: () -> Unit,
    onBiometricLoginSelected: () -> Unit
) {
    var showIpDialog by remember { mutableStateOf(false) }
    var ipAddress by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current

    // Initialize NetworkConfig
    LaunchedEffect(Unit) {
        NetworkConfig.initialize(context)
        ipAddress = NetworkConfig.getHostIp()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Select Login Method",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        // Host IP Button
        OutlinedButton(
            onClick = { showIpDialog = true },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        ) {
            Text("Configure Host IP (Current: ${NetworkConfig.getHostIp()})")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onNidLoginSelected,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
        ) {
            Text("Login with NID")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onBiometricLoginSelected,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
        ) {
            Text("Login with Biometric")
        }
    }

    if (showIpDialog) {
        AlertDialog(
            onDismissRequest = { showIpDialog = false },
            title = { Text("Configure Host IP") },
            text = {
                Column {
                    OutlinedTextField(
                        value = ipAddress,
                        onValueChange = { 
                            ipAddress = it
                            error = null
                        },
                        label = { Text("Host IP Address") },
                        isError = error != null,
                        supportingText = {
                            if (error != null) {
                                Text(error!!, color = MaterialTheme.colorScheme.error)
                            } else {
                                Text("Enter the IP address of your server (e.g., 192.168.1.102)")
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        try {
                            // Basic IP validation
                            if (!ipAddress.matches(Regex("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$"))) {
                                error = "Invalid IP address format"
                                return@Button
                            }
                            
                            // Validate each octet
                            val octets = ipAddress.split(".")
                            if (octets.size != 4 || octets.any { it.toIntOrNull() !in 0..255 }) {
                                error = "Invalid IP address values"
                                return@Button
                            }

                            NetworkConfig.updateHostIp(context, ipAddress)
                            showIpDialog = false
                        } catch (e: Exception) {
                            error = "Failed to update IP: ${e.message}"
                        }
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showIpDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
} 