package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = IndigoLight,
    onPrimary = SlateDarkBg,
    primaryContainer = IndigoDark,
    onPrimaryContainer = TextPrimaryDark,
    secondary = EmeraldLight,
    onSecondary = SlateDarkBg,
    secondaryContainer = EmeraldDark,
    onSecondaryContainer = TextPrimaryDark,
    tertiary = GoldLight,
    error = RedLight,
    background = SlateDarkBg,
    onBackground = TextPrimaryDark,
    surface = SlateDarkSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = SlateDarkBorder,
    onSurfaceVariant = TextSecondaryDark
)

private val LightColorScheme = lightColorScheme(
    primary = IndigoPrimary,
    onPrimary = SlateLightSurface,
    primaryContainer = IndigoLight,
    onPrimaryContainer = TextPrimaryLight,
    secondary = EmeraldAccent,
    onSecondary = SlateLightSurface,
    secondaryContainer = EmeraldLight,
    onSecondaryContainer = TextPrimaryLight,
    tertiary = GoldTertiary,
    error = RedDanger,
    background = SlateLightBg,
    onBackground = TextPrimaryLight,
    surface = SlateLightSurface,
    onSurface = TextPrimaryLight,
    surfaceVariant = SlateLightBorder,
    onSurfaceVariant = TextSecondaryLight
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Keep dynamicColor option, but default to our customized premium schemes
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
