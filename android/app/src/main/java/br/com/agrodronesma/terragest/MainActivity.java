package br.com.agrodronesma.terragest;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.Executor;

public class MainActivity extends BridgeActivity {
    private static final String PREFS_NAME = "TerraGestBiometricVault";
    private static final String KEY_EMAIL = "saved_email";
    private static final String KEY_PASS = "saved_pass";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.addJavascriptInterface(new BiometricJsBridge(this, webView), "TerraGestBiometrics");
            webView.addJavascriptInterface(new PdfJsBridge(this), "TerraGestPdf");
        }
    }

    public class BiometricJsBridge {
        private final MainActivity activity;
        private final WebView webView;

        public BiometricJsBridge(MainActivity activity, WebView webView) {
            this.activity = activity;
            this.webView = webView;
        }

        @JavascriptInterface
        public boolean isAvailable() {
            BiometricManager bm = BiometricManager.from(activity);
            int res = bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK | BiometricManager.Authenticators.DEVICE_CREDENTIAL);
            return res == BiometricManager.BIOMETRIC_SUCCESS;
        }

        @JavascriptInterface
        public boolean hasSavedCredentials() {
            SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String email = prefs.getString(KEY_EMAIL, "");
            String pass = prefs.getString(KEY_PASS, "");
            return !email.isEmpty() && !pass.isEmpty();
        }

        @JavascriptInterface
        public String getSavedEmail() {
            SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getString(KEY_EMAIL, "");
        }

        @JavascriptInterface
        public void saveCredentials(String email, String password) {
            SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putString(KEY_EMAIL, email != null ? email.trim() : "")
                .putString(KEY_PASS, password != null ? password : "")
                .apply();
        }

        @JavascriptInterface
        public void clearCredentials() {
            SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().clear().apply();
        }

        @JavascriptInterface
        public void authenticate() {
            activity.runOnUiThread(() -> {
                Executor executor = ContextCompat.getMainExecutor(activity);
                BiometricPrompt prompt = new BiometricPrompt(activity, executor, new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                        super.onAuthenticationSucceeded(result);
                        SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                        String email = prefs.getString(KEY_EMAIL, "");
                        String pass = prefs.getString(KEY_PASS, "");
                        String js = String.format(
                            "window.onTerraGestBiometricSuccess && window.onTerraGestBiometricSuccess(%s, %s);",
                            JSONObject.quote(email),
                            JSONObject.quote(pass)
                        );
                        webView.evaluateJavascript(js, null);
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                        super.onAuthenticationError(errorCode, errString);
                        String js = String.format(
                            "window.onTerraGestBiometricError && window.onTerraGestBiometricError(%s);",
                            JSONObject.quote(errString.toString())
                        );
                        webView.evaluateJavascript(js, null);
                    }
                });

                BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                    .setTitle("Desbloquear TerraGest ERP")
                    .setSubtitle("Confirme sua impressão digital ou biometria para entrar")
                    .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK | BiometricManager.Authenticators.DEVICE_CREDENTIAL)
                    .build();

                prompt.authenticate(promptInfo);
            });
        }
    }

    public class PdfJsBridge {
        private final MainActivity activity;

        public PdfJsBridge(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public void saveAndOpenPdf(String base64Data, String fileName) {
            activity.runOnUiThread(() -> {
                try {
                    String cleanBase64 = base64Data;
                    if (cleanBase64 != null && cleanBase64.contains(",")) {
                        cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                    }
                    byte[] pdfBytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                    String safeName = (fileName != null && !fileName.trim().isEmpty())
                        ? fileName.replaceAll("[^a-zA-Z0-9._-]", "_")
                        : "documento_terragest.pdf";
                    if (!safeName.toLowerCase().endsWith(".pdf")) {
                        safeName = safeName + ".pdf";
                    }

                    File outFile = new File(activity.getCacheDir(), safeName);
                    try (FileOutputStream fos = new FileOutputStream(outFile)) {
                        fos.write(pdfBytes);
                        fos.flush();
                    }

                    Uri contentUri = FileProvider.getUriForFile(
                        activity,
                        activity.getPackageName() + ".fileprovider",
                        outFile
                    );

                    Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                    viewIntent.setDataAndType(contentUri, "application/pdf");
                    viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);

                    try {
                        activity.startActivity(Intent.createChooser(viewIntent, "Abrir PDF"));
                    } catch (ActivityNotFoundException e) {
                        Intent shareIntent = new Intent(Intent.ACTION_SEND);
                        shareIntent.setType("application/pdf");
                        shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                        activity.startActivity(Intent.createChooser(shareIntent, "Compartilhar PDF"));
                    }
                } catch (Exception e) {
                    Toast.makeText(activity, "Erro ao abrir PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}
