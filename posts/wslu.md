# Windows Local Password Recovery (Utilman Method)

![Platform](https://img.shields.io/badge/Platform-Windows_10%2F11-blue)
![Type](https://img.shields.io/badge/Type-System_Recovery-red)
![Status](https://img.shields.io/badge/Status-Educational_Only-yellow)

## ⚠️ Disclaimer
**This guide is for educational purposes and personal recovery only.**
This method manipulates Windows system files (`System32`). Unethical use of this method to access computers without permission is illegal. The author assumes no liability for data loss or misuse.

## 📖 Overview
This documentation outlines a method to reset a forgotten **Local Administrator** password on Windows 10 or 11 without losing personal data. It utilizes the Windows Recovery Environment (WinRE) to temporarily replace the "Ease of Access" (Utility Manager) tool with the Command Prompt to gain System-level privileges at the lock screen.

## 🛠️ Prerequisites
* Physical access to the target PC / Laptop.
* A Local Windows Account (This may not work for online Microsoft Accounts linked to cloud authentication).
* No BitLocker encryption (or possession of the BitLocker recovery key).

---

## 🚀 The Process

### Phase 1: Accessing Windows Recovery Environment (WinRE)
1.  Turn on the PC and wait for the Login/Lock screen.
2.  Press and hold the **`SHIFT`** key on your keyboard.
3.  While holding `SHIFT`, click the **Power Button** icon on the screen and select **Restart**.
4.  Keep holding `SHIFT` until the "Choose an option" blue screen appears.
5.  Navigate to: **Troubleshoot** > **Advanced options** > **Command Prompt**.

### Phase 2: Swapping System Files
Once the Command Prompt window opens, execute the following commands in order.

> **Note:** The system drive is usually `C:`, but in recovery mode, it might be mounted as `D:`. If `C:` is empty, try `D:`.

1.  **Select the System Drive:**
    ```cmd
    C:
    ```
2.  **Navigate to System32:**
    ```cmd
    cd windows/system32
    ```
3.  **Backup the original Utility Manager:**
    ```cmd
    ren utilman.exe utilman1.exe
    ```
4.  **Replace Utility Manager with CMD:**
    ```cmd
    ren cmd.exe utilman.exe
    ```
5.  **Reboot:**
    ```cmd
    exit
    ```
    *Click "Continue" to boot into Windows.*

### Phase 3: Resetting the Password
1.  Once back at the Lock Screen, click the **Accessibility/Ease of Access icon** (bottom right, looks like a person/clock).
2.  A Command Prompt window should open (instead of the usual menu).
3.  Open the User Accounts panel by typing:
    ```cmd
    control userpasswords2
    ```
4.  In the window that appears:
    * Select the locked **User Account**.
    * Click **Reset Password**.
    * Enter a new password (or leave blank to remove it).
    * Click **OK**.
5.  Close the Command Prompt and log in with the new credentials.

---

## 🧹 Cleanup (Reverting Changes)
**Highly Recommended:** After recovering access, you should restore the original files to maintain system security and functionality.

1.  Repeat **Phase 1** to get back to the Recovery Command Prompt.
2.  Run these commands to reverse the changes:
    ```cmd
    C:
    cd windows/system32
    ren utilman.exe cmd.exe
    ren utilman1.exe utilman.exe
    exit
    ```

---

## 🧠 Technical Explanation
The **Utility Manager** (`utilman.exe`) is designed to run on the lock screen to assist users with disabilities (e.g., On-screen keyboard, Narrator). Because it runs *before* a user logs in, it requires **System** privileges.

By swapping `utilman.exe` with `cmd.exe` (Command Prompt), we trick the operating system into launching the terminal with those same System privileges. This bypasses the need for user authentication, allowing administrative commands (like changing passwords) to be executed freely.
