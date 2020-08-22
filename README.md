# Maslo Companion Kit  

![GitHub stars](https://img.shields.io/github/stars/heymaslo/companion-kit?style=social)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://github.com/Naereen/badges/)

  
## Overview
Maslo Companion Kit is a fully functional and customizable mobile application project for iOS and Android to capture signals. You can think of the Companion Kit as a trusted surface to capture signals. 

The Companion Kit also includes an optional web dashboard for care providers to get deeper insights into the signals users are expressing. 

Out of the box features include:
* Email\SMS\SSO Authentication Methods
* Text and voice check-ins
* Mood and location logging and
* Editable/customizable prompts
* Ability to schedule prompts
* Customizable notifications/reminders to check in
* Report exports to visualize progress
* Administer assessments and questionnaires
* Administration capability to summarize information by client
* Documents repository 
* Custom companion branding 
* Algorithms to generate insights from signals - options include Anxiety, Depression, Anger, Well-being, Energy, Mindfulness, and more.

Maslo has packaged components that allow customers & developers to easily customize and deploy the entire suite of Maslo capabilities in ways that meet their business needs.

## Use Cases
* Check-in companion for theripists and their clients
* Resilience building companion for coaches and their clients
* Clinical trials companion for researchers and their participants 
* Education companion for self guided and directed personalized learning
* Career companion for finding jobs and building skills
* And so much more... there are many possibilities!

On with it. Get to Growing Your Maslo!

## Getting Started
### Requirements

 * Node.js 10 ([`nvm`](https://github.com/nvm-sh/nvm) is preferable)
 * Expo CLI

 ```
 npm i -g expo-cli
 ```

 * Firebase Tools:

 ```
 npm i -g firebase-tools
 ```

Install all dependencies and validate Node.js version:

```bash
yarn all
```

### Structure

This repo organized as monorepo with simplified structure/flow. Roots are:

* `common` – Platform independent helpers, utils, dtos, project models and other re-usable code.
* `dashboard` – React-based web app for managing clients (care provider role)
* `mobile` – Expo/React Native-based mobile for clients
* `server` – Firebase-based project for API and database
* `config` – build time front-end project configuration and helpers for compiling them.

### Configuration files references

1. Frontend (mobile, dashboard and web) core configuration resides in files `./config/[appName].js`. It includes:
    * Firebase config (inclduing dashboard and mobile)
    * Integrations (Google, Sentry) settings
    * Features settings (on/off)
    * And build configs like Hostname, mobile app config (Expo) name, Expo release channel.

This configuration structure implies difference between `development`, `staging` and `production` environments per each project which may not be always necessary.

2. Mobile app Expo configuration: `./mobile/app.json` according to [Expo docs](https://docs.expo.io/workflow/configuration/)

3. Backend config file `server/functions/src/services/config/[appName].ts`

### Features used in Google Cloud Console and Firebase

 * Enable Sign In methods in Firebase Authentication tab: `Email/Password` + `Email link`, `Google` and `Apple`.
  * IAM: https://console.developers.google.com/apis/api/iam.googleapis.com/overview.
 * Cloud Speech-to-Text API: https://console.developers.google.com/apis/api/speech.googleapis.com/overview
 * Natural Language API: https://console.developers.google.com/apis/api/language.googleapis.com/overview
 * Cloud Vision AI API: https://console.developers.google.com/apis/api/vision.googleapis.com/overview
 * Blaze Plan


## Mobile Configuration

### Run & build app

1. To run project locally via Expo run `yarn start` from the `mobile/` folder

2. For building an APK (app bundle) or IPA use commands

```
yarn build:(ios|android):(stage|prod)
```

and manage all keystores/credentials via Expo.

It's important to use that command because there's a wrapper that ensures correct environment is caught up.

### Upload `ipa` to testflight via Fastlane

Install fastlane https://fastlane.tools/

```bash
fastlane pilot upload --skip_waiting_for_build_processing --skip_submission --ipa 'path/to/ipa'
```

## Dashboard

### How to run

1. To run project locally run `yarn dev` from the `dashboard/` folder

## Backend

### How to run

1. Make sure `server/functions/.env` file exists. (even blank)

2. Make sure `server/functions/.runtimeconfig.json` exists with

```json
{
  "envs": {
    "project_name": "[appName]",
    "sendgrid_api_key": "...",
    "sendgrid_emails_validation_api_key": "...",
    "is_prod": "false" // set false for staging,
    "devlogin": true,
    "twilio_phone_number_from": "...",
    "twilio_auth_token": "...",
    "twilio_account_sid": "..."
  }
}
```

3. Run `yarn dev:functions`

### How To Deploy

## Back-end/dashboard to staging/production
Deployment to Firebase services is managed by Firebase CLI and wrapped in convenience NPM commands in root package.json: 
* `deploy:dashboard:(stage|prod)` – builds Dashboard app with Webpack and deploys it to configured Hosting in current Firebase project.
* `deploy:server:(stage|prod)` – Server (Functions, Firestore Rules and Indexes)
For more details examine those commands, they are basically combined from other more specific ones.

## Deploy mobile apps to Play Market and App Store

Expo covers all the deployment process in [their documentation](https://docs.expo.io/distribution/introduction/) (and [here](https://docs.expo.io/distribution/uploading-apps/) specifically), but the highlights are:
* Making Standalone builds is required only when some native features have changed, including bundled assets, app permissions or dynamic links configuration. Also, it is required when the Expo SDK or application version changes and when there’s a need to use another Expo account.
* Since currently the mobile project uses [Expo Managed Workflow](https://docs.expo.io/introduction/managed-vs-bare/#managed-workflow), for all other cases like updated JS code or most types of assets – OTA (over-the-air) flow will work via [Publishing](https://docs.expo.io/workflow/publishing/).
* Expo account is required for deploying/publishing via Expo. Standalone builds queue, apps published JS and assets are associated with this account. It is totally not a problem to deploy a new standalone build using another Expo account, but is required to make Publishing work later.


### Structure

There're 2 main parts of the backend: API and database.

For API Firebase Functions are used. The approach is to have all write operations to be wrapped in functions, to make sure all validations are passed and data has been written properly.

For database Firebase Firestore is used. It has a lot of useful features, and allows not only fetch and cache data, but also to observe on frontends.

### Database

According to Firestore, data is organized in documents, collections and sub-collections of documents. Each document has data, that should always be described it Typescript types/interfaces.

Collections paths are hardcoded in `common/database/collections.ts` file; explicit usage  of collection paths not via this file should be avoided.

#### Database structure & access rules

* by default, read/write access to all documents is restricted to frontend clients.
* the most of write operations are done via API so all necessary validation is guaranteed to take place.
* `users`
  * collection of [`UserProfile`](../common/models/UserProfile.ts)s, an entiy for all users in the system
  * ID is `auth.uid`.
  * User can read only their own user profile.
  * `{userId}/public/info`
    * [`UserPublicProfile`](../common/models/UserProfile.ts) for fetching display name and avatar url by any authenticated user.
  * `{userId}/localSettings`
    * collection of [`UserLocalSettings`](../common/models/UserLocalSettings.ts), each is some service info stored for consistency, analytics and debug, for each device user has used.
    * ID is a device unique identifier
    * User can read & write their own entries.
* `coaches`
  * collection of [`CoachProfile`](../common/modles/CoachProfile.ts), profile data related to Coach role.
  * ID is `auth.uid`.
  * Coach can read their own coach profile.
  * `{coachId}/clients`
    * collection of [`ClientCard`](../common/models/ClientCard.ts), client info from coach perspective; can be in different states, so not always tied to real client user.
    * ID is a unique string.
    * Coach can read/write their client cards.
    * `{clientCardId}/sessions`
      * collection of sessions entries [`ClientSessionEntry`](../common/models/ClientEntries.ts)
      * ID is a unique string.
      * Coach can read and create these entries. Client can (possibly in future) read
    * `{clientCardId}/insights`
      * collection of sessions entries [`IntelligentInsightFeedback`](../common/models/IntelligentInsights.ts)
      * ID is a unique string.
      * Coach can read and create these entries.
    * `{clientCardId}/documents`
      * collection of sessions entries [`DocumentEntry`](../common/models/Documents.ts)
      * ID is a unique string.
      * Coach can read and create these entries.
    * `{clientCardId}/timeTracking`
      * collection of sessions entries [`TimeTrackingEntry`](../common/models/TimeTracking.ts)
      * ID is a unique string.
      * Coach can read and create these entries.
* `invitations`
  * collection of [`Invitation`](../common/models/Invitation.ts), invitation for client (and maybe coaches in future).
  * ID is invited persons's email.
  * also it contains statuses history (see [`EntityWithStatus`](../common/models/EntityWithStatus.ts))
* `clients`
  * collection of [`ClientProfile`](../common/models/ClientProfile.ts), profile data related to Client role.
  * ID is `auth.uid`.
  * Client can read their own profile
  * `{clientId}/accounts`
    * collection of [`ClientAccount`](../common/models/ClientProfile.ts)s, which connects client & coach. Created at the moment Client accepts Coachs's invitation. In such way client can have multiple accounts, each should be represented in this collection so client may take 1st active or choose one from the list.
    * ID is `ClientCard`'s ID, so it should be easier to track this relation.
    * Client can read all their accounts and all nested documents.
    * `{clientCardId}/journal`
      * collection of [`ClientJournalEntry`](../common/models/ClientEntries.ts)s, data related to one Journal entry. Also contains related metadata.
      * ID is a unique string.
      * Coach can read jorunal entries related to their account.
    * `{clientCardId}/intakeforms`
      * collection of [`AssessmentData`](../common/models/intakeForms/index.ts)s, data related to each assessment entry posted by Client.
      * ID is a unique string.
      * Coach can read assessment entries related to their account.
  * `{clientCardId}/events`
      * collection of [`AnyEvent`](../common/models/Events.ts)s, data related to in-app events assigned by coach. ATTOW Events are processed each 5 minutes. Processed events being cleared after 24hrs after trigger time.
      * ID is a unique string.
      * Coach can read events entries related to their account.
* `records`
  * collection of [`RecordData`](../common/models/RecordData.ts), each for `journal` or `session` entry. An item represents entry's processing result.
  * ID is a unique string.
  * Coach and Client can read only entries related to their accounts.
* `tips`
  * collection of [`StaticTipItem`](../common/models/StaticTips.ts). ATTOW each item is added manually via Firebase Dashboard.
  * ID is a unique string
  * Client can read all values
* `prompts`
  * collection of [`PromptsLibrary`](../common/models/prompts/Prompt.ts)s. Each is a Coach's Library of custom prompts and tips.
  * ID is `auth.uid` (`coachId`) of Coach.
  * Coach can read only their own Library.
  * `{coachId}/clientPrompts`
    * collection of [`ClientPrompts`](../common/models/prompts/Prompt.ts), each is a Client's personal settings/data for this Coach's library.
    * ID is `auth.uid` (`clientId`) of Client.
    * Client has access to Library only if their current state is present

#### API

API is exposed via Firebase Cloud Functions. Function can be an API endpoint, Scheduler listener or PubSub listener.

Each endpoint might handle few types of requests to make amount of Functions deployed as less as possible. These requests types are group into endpoints by features, logic and services.

Every request type for every endpoint in the system has clear and [straightforward declaration](../common/abstractions/functions.ts), grouped by namespaces. A declaration allows all calls to be consistent across platforms.
