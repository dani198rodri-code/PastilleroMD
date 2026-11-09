# Mi Pastillero - Compilación Automática de APK en GitHub

Este repositorio incluye un flujo automatizado de **GitHub Actions** que compila la APK en los servidores en la nube de GitHub, sin necesidad de que tengas Android Studio ni Java instalados en tu PC.

---

## Pasos para compilar tu APK en GitHub:

1. **Crea un repositorio en GitHub:**
   - Entra a [github.com](https://github.com) e inicia sesión.
   - Haz clic en **New repository** (Nuevo repositorio).
   - Ponle de nombre: `mi-pastillero-apk`.
   - Selecciona **Public** (o Private) y presiona **Create repository**.

2. **Sube estos archivos:**
   - Puedes arrastrar todo el contenido de este proyecto o subirlo con Git:
     ```bash
     git init
     git add .
     git commit -m "Compilar APK"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/mi-pastillero-apk.git
     git push -u origin main
     ```
   *(Asegúrate de que la carpeta oculta `.github/workflows/build_apk.yml` esté incluida).*

3. **Descarga tu APK:**
   - En tu repositorio de GitHub, haz clic en la pestaña superior **Actions**.
   - Verás el flujo **"Compilar APK Android"** ejecutándose automáticamente (dura entre 2 y 4 minutos).
   - Cuando termine (aparecerá un círculo verde con un check ✓):
     1. Haz clic sobre la ejecución.
     2. En la sección inferior llamada **Artifacts** (Artefactos), haz clic en **MiPastillero-APK**.
     3. Se descargará un archivo ZIP que contiene directamente tu archivo `app-debug.apk` listo para pasar e instalar en tu celular.
