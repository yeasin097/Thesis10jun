package com.thesis.patientportal.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.thesis.patientportal.api.NetworkModule
import com.thesis.patientportal.data.Doctor
import kotlinx.coroutines.launch
import retrofit2.Response

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DoctorSearchScreen(
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var doctors by remember { mutableStateOf<List<Doctor>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val apiService = remember { NetworkModule.apiService }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search Doctors") },
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
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Enter specialty (e.g. Cardiologist)") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                singleLine = true,
                shape = MaterialTheme.shapes.medium
            )

            // Search Button
            Button(
                onClick = {
                    if (searchQuery.isBlank()) {
                        error = "Please enter a specialty to search"
                        return@Button
                    }
                    
                    scope.launch {
                        isLoading = true
                        error = null
                        try {
                            val response = apiService.searchDoctorsBySpecialty(searchQuery)
                            if (response.isSuccessful) {
                                val doctorList = response.body()
                                if (doctorList != null) {
                                    doctors = doctorList
                                    if (doctors.isEmpty()) {
                                        error = "No doctors found for the specialty: $searchQuery"
                                    }
                                } else {
                                    error = "No data received from server"
                                }
                            } else {
                                error = when (response.code()) {
                                    404 -> "No doctors found for the specialty: $searchQuery"
                                    else -> "Failed to fetch doctors: ${response.message()}"
                                }
                            }
                        } catch (e: Exception) {
                            error = when (e) {
                                is java.net.UnknownHostException -> "No internet connection. Please check your network."
                                is java.net.SocketTimeoutException -> "Request timed out. Please try again."
                                else -> "An error occurred: ${e.message ?: "Unknown error"}"
                            }
                        } finally {
                            isLoading = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Text("Search")
            }

            // Loading Indicator
            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }

            // Error Message
            error?.let { errorMessage ->
                Text(
                    text = errorMessage,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(16.dp)
                )
            }

            // Doctor List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(doctors) { doctor ->
                    DoctorCard(doctor = doctor)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DoctorCard(doctor: Doctor) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = doctor.name,
                style = MaterialTheme.typography.titleLarge
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = doctor.specialty,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = doctor.hospital,
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = doctor.address,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
} 