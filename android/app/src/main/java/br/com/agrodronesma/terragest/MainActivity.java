package br.com.agrodronesma.terragest;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;
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
}
