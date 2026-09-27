export interface AndroidFile {
  path: string;
  category: 'build' | 'manifest' | 'data' | 'di' | 'network' | 'worker' | 'ui';
  title: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/build.gradle.kts',
    category: 'build',
    title: 'تنظیمات ساخت برنامه (Build Script)',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "ir.sepehr.enterprise.automation"
    compileSdk = 35

    defaultConfig {
        applicationId = "ir.sepehr.enterprise.automation"
        minSdk = 26
        targetSdk = 35
        versionCode = 104
        versionName = "1.4.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // Room Schema Export
        javaCompileOptions {
            annotationProcessorOptions {
                arguments["room.schemaLocation"] = "$projectDir/schemas"
            }
        }
    }

    signingConfigs {
        create("release") {
            storeFile = file("../keystore/enterprise_release.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD") ?: "Enterprise@Secure2026!"
            keyAlias = "enterprise_key"
            keyPassword = System.getenv("KEY_PASSWORD") ?: "Enterprise@Secure2026!"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Hilt Dependency Injection
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-android-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

    // Room Database & SQLCipher Encryption
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    implementation("net.zetetic:android-database-sqlcipher:4.5.4")

    // Retrofit & OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Security & EncryptedSharedPreferences
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("androidx.hilt:hilt-work:1.1.0")

    // CameraX & ML Kit Barcode/QR
    implementation("androidx.camera:camera-camera2:1.3.1")
    implementation("androidx.camera:camera-lifecycle:1.3.1")
    implementation("androidx.camera:camera-view:1.3.1")
    implementation("com.google.mlkit:barcode-scanning:17.2.0")
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    title: 'مانیفست برنامه و مجوزهای امنیتی',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />

    <application
        android:name=".EnterpriseApp"
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.EnterpriseAutomation"
        android:networkSecurityConfig="@xml/network_security_config"
        tools:targetApi="34">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.EnterpriseAutomation">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Secure FileProvider -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/java/ir/sepehr/enterprise/data/local/LetterEntity.kt',
    category: 'data',
    title: 'موجودیت نامه با تفکیک چندشرکتی در Room',
    code: `package ir.sepehr.enterprise.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Letter entity with strict tenant partitioning by company_id
 */
@Entity(
    tableName = "letters",
    indices = [
        Index(value = ["company_id"]),
        Index(value = ["company_id", "letter_number"], unique = true),
        Index(value = ["qr_code_token"])
    ]
)
data class LetterEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String,

    @ColumnInfo(name = "company_id")
    val companyId: String,

    @ColumnInfo(name = "letter_number")
    val letterNumber: String,

    @ColumnInfo(name = "secretariat_number")
    val secretariatNumber: String,

    @ColumnInfo(name = "direction")
    val direction: String, // incoming, outgoing, internal

    @ColumnInfo(name = "subject")
    val subject: String,

    @ColumnInfo(name = "body")
    val body: String,

    @ColumnInfo(name = "letter_date")
    val letterDate: String,

    @ColumnInfo(name = "sender_name")
    val senderName: String,

    @ColumnInfo(name = "receiver_name")
    val receiverName: String,

    @ColumnInfo(name = "priority")
    val priority: String,

    @ColumnInfo(name = "confidentiality_level")
    val confidentialityLevel: String,

    @ColumnInfo(name = "status")
    val status: String,

    @ColumnInfo(name = "is_locked")
    val isLocked: Boolean,

    @ColumnInfo(name = "signed_by_user_name")
    val signedByUserName: String?,

    @ColumnInfo(name = "signed_at")
    val signedAt: String?,

    @ColumnInfo(name = "qr_code_token")
    val qrCodeToken: String,

    @ColumnInfo(name = "sync_status")
    val syncStatus: String = "SYNCED", // PENDING, SYNCED, CONFLICT

    @ColumnInfo(name = "last_updated_at")
    val lastUpdatedAt: Long = System.currentTimeMillis()
)`,
  },
  {
    path: 'app/src/main/java/ir/sepehr/enterprise/data/local/LetterDao.kt',
    category: 'data',
    title: 'دستورات دسترسی به داده (Room DAO) با فیلتر شرکت',
    code: `package ir.sepehr.enterprise.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface LetterDao {

    /**
     * Enforces company_id filtering at the SQLite layer
     */
    @Query("SELECT * FROM letters WHERE company_id = :companyId ORDER BY last_updated_at DESC")
    fun getLettersByCompany(companyId: String): Flow<List<LetterEntity>>

    @Query("SELECT * FROM letters WHERE id = :letterId AND company_id = :companyId LIMIT 1")
    suspend fun getLetterById(letterId: String, companyId: String): LetterEntity?

    @Query("SELECT * FROM letters WHERE qr_code_token = :qrToken AND company_id = :companyId LIMIT 1")
    suspend fun getLetterByQrToken(qrToken: String, companyId: String): LetterEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(letter: LetterEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(letters: List<LetterEntity>)

    @Query("SELECT * FROM letters WHERE sync_status = 'PENDING'")
    suspend fun getPendingSyncLetters(): List<LetterEntity>

    @Query("DELETE FROM letters WHERE company_id = :companyId")
    suspend fun clearCompanyLetters(companyId: String)
}`,
  },
  {
    path: 'app/src/main/java/ir/sepehr/enterprise/data/security/TokenManager.kt',
    category: 'data',
    title: 'نگهداری امن توکن در Android Keystore',
    code: `package ir.sepehr.enterprise.data.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "enterprise_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveAuthTokens(accessToken: String, refreshToken: String) {
        sharedPreferences.edit()
            .putString("KEY_ACCESS_TOKEN", accessToken)
            .putString("KEY_REFRESH_TOKEN", refreshToken)
            .apply()
    }

    fun getAccessToken(): String? = sharedPreferences.getString("KEY_ACCESS_TOKEN", null)

    fun getRefreshToken(): String? = sharedPreferences.getString("KEY_REFRESH_TOKEN", null)

    fun saveActiveCompanyId(companyId: String) {
        sharedPreferences.edit().putString("KEY_ACTIVE_COMPANY_ID", companyId).apply()
    }

    fun getActiveCompanyId(): String = sharedPreferences.getString("KEY_ACTIVE_COMPANY_ID", "") ?: ""

    fun clearAllOnSwitchOrLogout() {
        sharedPreferences.edit().clear().apply()
    }
}`,
  },
  {
    path: 'app/src/main/java/ir/sepehr/enterprise/data/network/TenantHeaderInterceptor.kt',
    category: 'network',
    title: 'اینترسپتور اعتبارسنجی خودکار Company Context در API',
    code: `package ir.sepehr.enterprise.data.network

import ir.sepehr.enterprise.data.security.TokenManager
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

/**
 * Injects Authorization Bearer Token and X-Company-Id Header into every HTTP request
 */
class TenantHeaderInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val builder = originalRequest.newBuilder()

        // 1. Inject JWT Access Token
        tokenManager.getAccessToken()?.let { token ->
            builder.addHeader("Authorization", "Bearer $token")
        }

        // 2. Inject Active Company ID for strict server-side tenant scoping
        val activeCompanyId = tokenManager.getActiveCompanyId()
        if (activeCompanyId.isNotBlank()) {
            builder.addHeader("X-Company-Id", activeCompanyId)
        }

        builder.addHeader("X-App-Platform", "Android-JetpackCompose")
        builder.addHeader("Accept", "application/json")

        val response = chain.proceed(builder.build())

        // Catch 403 Forbidden cross-tenant violation
        if (response.code == 403) {
            // Signal security listener
        }

        return response
    }
}`,
  },
  {
    path: 'app/src/main/java/ir/sepehr/enterprise/worker/SyncWorker.kt',
    category: 'worker',
    title: 'همگام‌سازی آفلاین پس‌زمینه با WorkManager',
    code: `package ir.sepehr.enterprise.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import ir.sepehr.enterprise.data.local.LetterDao
import ir.sepehr.enterprise.data.network.EnterpriseApiService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val letterDao: LetterDao,
    private val apiService: EnterpriseApiService
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // 1. Fetch pending offline drafts/letters
            val pendingLetters = letterDao.getPendingSyncLetters()

            for (letter in pendingLetters) {
                // Submit to server
                val response = apiService.syncOfflineLetter(
                    companyId = letter.companyId,
                    letterId = letter.id,
                    payload = letter
                )

                if (response.isSuccessful) {
                    letterDao.insertOrUpdate(letter.copy(syncStatus = "SYNCED"))
                }
            }

            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/ir/sepehr/enterprise/ui/screens/SecretariatScreen.kt',
    category: 'ui',
    title: 'رابط کاربری Jetpack Compose دبیرخانه با طراحی RTL',
    code: `package ir.sepehr.enterprise.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import ir.sepehr.enterprise.data.local.LetterEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecretariatScreen(
    companyName: String,
    letters: List<LetterEntity>,
    onLetterClick: (String) -> Unit,
    onNewLetterClick: () -> Unit,
    onScanQrClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(text = "دبیرخانه و نامه‌نگاری", style = MaterialTheme.typography.titleMedium)
                        Text(text = companyName, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                    }
                },
                actions = {
                    IconButton(onClick = onScanQrClick) {
                        Text("📷 QR")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNewLetterClick) {
                Text("+ نامه جدید")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(letters) { letter ->
                Card(
                    onClick = { onLetterClick(letter.id) },
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = letter.letterNumber, style = MaterialTheme.typography.labelMedium)
                            Text(text = letter.letterDate, style = MaterialTheme.typography.bodySmall)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = letter.subject, style = MaterialTheme.typography.titleSmall)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "گیرنده: \${letter.receiverName}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}`,
  },
];
