package com.thesis.patientportal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.thesis.patientportal.data.NetworkConfig
import com.thesis.patientportal.data.PatientInfo
import com.thesis.patientportal.screens.*
import com.thesis.patientportal.ui.theme.PatientPortalTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize NetworkConfig
        NetworkConfig.initialize(this)
        
        enableEdgeToEdge()
        setContent {
            PatientPortalTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    var loggedInPatient by remember { mutableStateOf<PatientInfo?>(null) }
                    
                    NavHost(
                        navController = navController,
                        startDestination = "splash"
                    ) {
                        composable("splash") {
                            SplashScreen(
                                onNavigateToLogin = {
                                    navController.navigate("login_type") {
                                        popUpTo("splash") { inclusive = true }
                                    }
                                }
                            )
                        }
                        composable("login_type") {
                            LoginTypeScreen(
                                onNidLoginSelected = {
                                    navController.navigate("nid_login")
                                },
                                onBiometricLoginSelected = {
                                    navController.navigate("biometric_login")
                                }
                            )
                        }
                        composable("nid_login") {
                            NidLoginScreen(
                                onLoginSuccess = { patientInfo ->
                                    loggedInPatient = patientInfo
                                    navController.navigate("patient_home") {
                                        popUpTo("login_type") { inclusive = true }
                                    }
                                },
                                onBack = {
                                    navController.navigateUp()
                                }
                            )
                        }
                        composable("biometric_login") {
                            BiometricLoginScreen(
                                onLoginSuccess = { patientInfo ->
                                    loggedInPatient = patientInfo
                                    navController.navigate("patient_home") {
                                        popUpTo("login_type") { inclusive = true }
                                    }
                                },
                                onBack = {
                                    navController.navigateUp()
                                }
                            )
                        }
                        composable("patient_home") {
                            PatientHomeScreen(
                                patientInfo = loggedInPatient,
                                onLogout = {
                                    loggedInPatient = null
                                    navController.navigate("login_type") {
                                        popUpTo("patient_home") { inclusive = true }
                                    }
                                },
                                onSearchDoctor = {
                                    navController.navigate("doctor_search")
                                },
                                onViewEhrs = {
                                    navController.navigate("ehr_screen")
                                },
                                onViewPermissions = {
                                    navController.navigate("permissions_screen")
                                }
                            )
                        }
                        composable("doctor_search") {
                            DoctorSearchScreen(
                                onBack = {
                                    navController.navigateUp()
                                }
                            )
                        }
                        composable("ehr_screen") {
                            EhrScreen(
                                patientNid = loggedInPatient?.nid_no ?: "",
                                onBack = {
                                    navController.navigateUp()
                                },
                                onDownloadPdf = { ehr ->
                                    // Handle PDF download
                                }
                            )
                        }
                        composable("permissions_screen") {
                            PermissionsScreen(
                                patientNid = loggedInPatient?.nid_no ?: "",
                                onBack = {
                                    navController.navigateUp()
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}