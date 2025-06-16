package com.thesis.patientportal.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LoginTypeScreen(
    onNidLoginSelected: () -> Unit,
    onBiometricLoginSelected: () -> Unit
) {
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
} 