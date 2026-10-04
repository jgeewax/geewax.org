---
title: "Flutter Sign In with Apple using Firebase"
description: "The code for Sign In with Apple in Flutter is two lines. The Apple Developer and Firebase configuration is not. Here is every step, in order, and which ones you can skip if you only ship on iOS."
tags: [flutter]
date: 2023-04-26
---

The Dart code for Sign in with Apple is two lines. The setup across Apple's developer portal, Firebase, and Xcode is a lot more than that, and the official docs spread it over several pages for different platforms. This is every step, in order.

## What you need depends on where your app runs

**iOS only:** an App ID with Sign in with Apple enabled, the Apple provider turned on in Firebase, the capability added in Xcode, and the code. That's enough to sign users in.

**Account deletion (most iOS apps):** if users can create an account in your app, the App Store requires that they can delete it from inside the app, and Apple expects you to revoke their Sign in with Apple token when they do. Revoking needs a private key configured in Firebase. If you're shipping to the App Store, plan on doing this part too.

**Android or web:** everything above, plus a Services ID and a return URL so Apple can redirect back to Firebase.

The sections below follow that order. Stop when you've covered your platforms.

## Before you start

- You need a paid [Apple Developer Program](https://developer.apple.com/programs/enroll/) membership. Enrollment can take a couple of days.
- Your Flutter app should already be connected to Firebase (for example with `flutterfire configure`).
- Know your iOS bundle ID. It's `PRODUCT_BUNDLE_IDENTIFIER` in Xcode, and it has to match the iOS app registered in Firebase and the App ID you create next.

## Create an App ID

If you've already shipped this app, you probably have an App ID. Open it on the [Identifiers page](https://developer.apple.com/account/resources/identifiers/list/bundleId), check **Sign In with Apple**, save, and skip ahead.

Otherwise, go to the [Identifiers page](https://developer.apple.com/account/resources/identifiers/list/bundleId) and click the plus sign next to Identifiers.

![Identifiers page with the plus button next to the heading](/images/posts/flutter-sign-in-with-apple/image-9.png)

Choose **App IDs** and click Continue.

![Register a new identifier, with App IDs selected](/images/posts/flutter-sign-in-with-apple/image-10.png)

Choose **App** (an App Clip is a small piece of an app that runs without installing it) and click Continue.

![Select a type: App or App Clip](/images/posts/flutter-sign-in-with-apple/image-11.png)

Enter a description (anything, you can change it later) and your bundle ID, e.g. `com.myapp.bundleid`. While you're here, write down the **App ID Prefix**. That's your Team ID, and Firebase asks for it later.

![Register an App ID form with description, bundle ID, and App ID Prefix](/images/posts/flutter-sign-in-with-apple/image-13.png)

Scroll down and check **Sign In with Apple**. Leave it on "Enable as a primary App ID".

![Sign In with Apple checked, set as a primary App ID](/images/posts/flutter-sign-in-with-apple/image-14.png)

Scroll back up and click Register.

## Add the capability in Xcode

Open `ios/Runner.xcworkspace` in Xcode, select the **Runner** target, and go to the **Signing & Capabilities** tab. Click **+ Capability**, search for "Sign in with Apple", and double-click it. Xcode updates `Runner.entitlements` for you, so commit that file along with the project changes.

## Turn on Apple in Firebase

In the Firebase console, go to **Security > Authentication**, open the **Sign-in method** tab, and click **Add new provider**.

![Firebase Authentication, Sign-in method tab, Add new provider button](/images/posts/flutter-sign-in-with-apple/image-7.png)

Pick **Apple** and flip **Enable** on. For an iOS-only app you can leave every field empty and click Save. The Services ID field even says "not required for Apple". You'll come back to this screen if you add the private key or support Android and web.

## Write the code

Add the package:

```sh
flutter pub add firebase_auth
```

Then sign in:

```dart
import 'package:firebase_auth/firebase_auth.dart';

Future<UserCredential> signInWithApple() {
  final provider = AppleAuthProvider()
    ..addScope('email')
    ..addScope('name');
  return FirebaseAuth.instance.signInWithProvider(provider);
}
```

On iOS this shows Apple's native sheet. On Android it opens a browser tab. On web, use `signInWithPopup` instead of `signInWithProvider`.

You can use the returned `UserCredential` directly, but most apps listen for auth state changes and route from there:

```dart
FirebaseAuth.instance.authStateChanges().listen((User? user) {
  if (user != null) {
    // Signed in. Go to your home screen.
  }
});
```

Apple only shares the user's name and email the first time they sign in to your app. Save what you need from that first sign-in, because later sign-ins won't include it. Users who choose "Hide My Email" get a `privaterelay.appleid.com` address instead of their real one.

If you're iOS only and don't let users create accounts, you're done.

## Create a private key

Go to the [Keys page](https://developer.apple.com/account/resources/authkeys/list) and click the plus sign next to Keys.

Give the key a name. It can't contain special characters like dots or dashes, so `com.myapp.bundleid` won't work. Something like "MyApp Sign in with Apple" is fine.

Check **Sign in with Apple** and click **Configure**.

![Sign in with Apple checked on the new key, with the Configure button](/images/posts/flutter-sign-in-with-apple/image-2.png)

Choose your App ID as the Primary App ID and click Save. Then click Continue and Register.

On the confirmation page, write down the **Key ID** (a 10-character string Apple assigns, not the name you picked) and download the key. It's a `.p8` file, and Apple only lets you download it once.

## Give Firebase the key

Back in the Firebase console, open the Apple provider again and expand **OAuth code flow configuration**.

- **Apple team ID** is the App ID Prefix from your App ID, e.g. `ABCDE12345`.
- **Key ID** is the 10-character ID from the key page, e.g. `XYZ9876543`.
- **Private key** is the full contents of the `.p8` file, including the `BEGIN` and `END` lines.

![Firebase Apple provider settings: Services ID, team ID, key ID, and private key](/images/posts/flutter-sign-in-with-apple/image-8.png)

Click Save.

## Revoke the token when a user deletes their account

Apple's authorization codes are single-use and expire after five minutes, so you can't keep the one from the original sign-in. Reauthenticate to get a fresh code, revoke it, then delete the user:

```dart
Future<void> deleteAccount() async {
  final user = FirebaseAuth.instance.currentUser!;
  final credential = await user.reauthenticateWithProvider(AppleAuthProvider());
  final code = credential.additionalUserInfo?.authorizationCode;
  if (code != null) {
    await FirebaseAuth.instance.revokeTokenWithAuthorizationCode(code);
  }
  await user.delete();
}
```

Reauthenticating first also avoids the `requires-recent-login` error Firebase throws when you delete a user who signed in a while ago.

If you only ship on iOS, you're done.

## Android and web: create a Services ID

Go to the [new Services ID page](https://developer.apple.com/account/resources/identifiers/add/serviceId), make sure **Services IDs** is selected, and click Continue.

![Register a new identifier, with Services IDs selected](/images/posts/flutter-sign-in-with-apple/image.png)

Enter a description and an identifier. The identifier has to be unique, and it can't be the same as your bundle ID. I add `.service` to the bundle ID, e.g. `com.myapp.bundleid.service`, so I can tell which app it belongs to. Click Continue.

![Register a Services ID form with description and identifier](/images/posts/flutter-sign-in-with-apple/image-1.png)

Check for typos and click Register.

![Services ID confirmation page with the Register button](/images/posts/flutter-sign-in-with-apple/image-4.png)

## Android and web: set the return URL

Apple needs to know where to send users after they sign in. Firebase handles that redirect at a URL based on your Firebase project ID, which you can find under **Project settings** in the Firebase console.

Go back to the [Identifiers page](https://developer.apple.com/account/resources/identifiers/list). The list shows App IDs by default, so use the menu in the top right to switch to **Services IDs**.

![Identifier type menu with Services IDs option](/images/posts/flutter-sign-in-with-apple/image-3.png)

Click your Services ID, check **Sign In with Apple**, and click **Configure**.

![Edit your Services ID Configuration with Sign In with Apple checked](/images/posts/flutter-sign-in-with-apple/image-5.png)

In the dialog:

- **Primary App ID**: your App ID.
- **Domains and Subdomains**: `YOUR_PROJECT_ID.firebaseapp.com`
- **Return URLs**: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`

Click Next, then Done, then Continue and Save.

## Android and web: finish the Firebase setup

Open the Apple provider in the Firebase console one more time and enter your Services ID (e.g. `com.myapp.bundleid.service`). The OAuth code flow fields need to be filled in too, so do the private key steps above if you skipped them.

For Android, also add your app's SHA-1 fingerprint under **Project settings > Your apps** if it isn't there already.

If your app sends Firebase emails (password resets, email verification) to users who chose "Hide My Email", register `noreply@YOUR_PROJECT_ID.firebaseapp.com` with Apple's [private email relay service](https://developer.apple.com/account/resources/services/configure). Otherwise Apple won't forward them.
