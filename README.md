![A Companion For Every Person](https://github.com/HeyMaslo/companion-kit/blob/master/.github/maslo_companion_kit.001.jpeg)

# Maslo Companion Kit  

![GitHub stars](https://img.shields.io/github/stars/heymaslo/companion-kit?style=social)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://github.com/Naereen/badges/)
![Twitter Follow](https://img.shields.io/twitter/follow/heymaslo?style=social)

  
## Overview
Companions are personal, trusted, and adaptable AI’s that meet people where they are and help them get to where they want to be. They are surface agnostic and can live on websites, mobile apps, computers, in car dashboards, and more.

Maslo Companion Kit is a fully functional and customizable mobile application project for iOS and Android to grow your own companion. The Companion Kit also includes an optional web dashboard for care providers to get deeper insights into the signals users are expressing. 

Out of the box features include:
* Email/SMS/SO Authentication Methods
* Text and voice check-ins
* Mood and location logging 
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
* Check-in companion for therapists and their clients
* Resilience building companion for coaches and their clients
* Clinical trials companion for researchers and their participants 
* Education companion for self guided and directed personalized learning
* Career companion for finding jobs and building skills
* And so much more... there are many possibilities!

<img src="/examples/SigBee/SigBee.png" width="25%"> <img src="/examples/Aibly/Aibly.png" width="25%"> <img src="/examples/Canbe/Canbe.png" width="25%"> <img src="/examples/Carree/Carree.png" width="25%"> <img src="/examples/Emily/Emily.png" width="25%"> <img src="/examples/eva/Eva.png" width="25%"> <img src="/examples/Opti/Opti.png" width="25%"> <img src="/examples/Stella/Stella.png" width="25%"> <img src="/examples/pAIper/Paiper.png" width="25%">

On with it. Get to Growing Your Maslo!

## Getting Started
### Requirements

 * Node.js 10 ([`nvm`](https://github.com/nvm-sh/nvm) is preferable)
 * Expo CLI
 
 NPM
 ```
 npm i -g expo-cli
 ```
 Yarn
 ```
 yarn global add expo-cli
 ```

 * Firebase Tools:

NPM
 ```
 npm i -g firebase-tools
 ```
Yarn

```
yarn global add firebase-tools
```

### Mobile dependecies

To get better user experience on mobile app, there will be needed to clone two dependecies that are for mobile: [maslo-persona](https://github.com/HeyMaslo/maslo-persona) and [react-native-switch-pro](https://github.com/HeyMaslo/react-native-switch-pro).

Firstly, from the root folder, navigate to the mobile/dependencies folder.

```bash
cd mobile/dependencies
```

And then, clone the maslo-persona into the persona folder.

```bash
git clone https://github.com/HeyMaslo/maslo-persona.git persona
```

Make sure the cloned project folder is **persona**, not **maslo-persona**.

Change to the dev-tool branch.

```bash
git checkout "dev-ts"
```

And lastly, clone react-native-switch-pro.

```bash
git clone https://github.com/HeyMaslo/react-native-switch-pro.git
```

Install all dependencies and validate Node.js version:

### Do this in root, mobile and dashboard directories to install all the needed packages.

Yarn
```bash
yarn all
```

NPM
```
npm install
```

### Structure (basics)

This repo organized as monorepo with simplified structure/flow. Roots are:

* `common` – Platform independent helpers, utils, dtos, project models and other re-usable code.
* `dashboard` – React-based web app for managing clients (care provider role)
* `mobile` – Expo/React Native-based mobile for clients
* `server` – Firebase-based project for API and database
* `config` – build time front-end project configuration and helpers for compiling them.

### Configuration files references

1. Frontend (mobile, dashboard and web) core configuration resides in files `./config/example_app.js` (rename to `app.js` and fill the config fields). It includes:
    * Firebase config (inclduing dashboard and mobile)
    * Integrations (Google, Sentry) settings
    * Features settings (on/off)
    * And build configs like Hostname, mobile app config (Expo) name, Expo release channel.

2. Common configuration file `./common/constants/features.ts`.
    * Enable/disable dashboard features
    * Enable/disable mobile features
        * Allow check-ins delete
        * Allow check-ins privateness
        * Ask for location 

This configuration structure implies difference between `development`, `staging` and `production` environments per each project which may not be always necessary.

3. Mobile app Expo configuration: `./mobile/app.json` according to [Expo docs](https://docs.expo.io/workflow/configuration/)

5. Firebase config `./server/.firebaserc`

6. Environment config file `./server/functions/.env` (should be created if not exists).
    * .env file content `GOOGLE_APPLICATION_CREDENTIALS=/path/to/json/credentials`

The creditial file is created on Firebase Console under the Project Settings. Generate the credential clicking on ***Generate new private key*** button and save this to a folder. Don't forget to add this json file to the git ignore.

7. Backend config file `server/functions/src/services/config/app.ts`

### Features used in Google Cloud Console and Firebase

 * Enable Sign In methods in Firebase Authentication tab: `Email/Password` + `Email link`, `Google` and `Apple`.
 * IAM: https://console.developers.google.com/apis/api/iam.googleapis.com/overview.
 * Cloud Speech-to-Text API: https://console.developers.google.com/apis/api/speech.googleapis.com/overview
 * Natural Language API: https://console.developers.google.com/apis/api/language.googleapis.com/overview
 * Cloud Vision AI API: https://console.developers.google.com/apis/api/vision.googleapis.com/overview
 * Blaze Plan


### State Management

Application state is stored and managed by the Controllers layer.
Controllers expose getters for the state and methods to mutate it. 
Entry point for controllers is AppController (mobile: `mobile/src/controllers/index.ts`, dashboard: `dashboard/src/app/controllers/index.ts`).
Observing is organized via MobX. It allows with a minimum amount of user code to catch events when some data changes.

## Mobile

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

## How To Deploy

### Back-end/dashboard to staging/production

Deployment to Firebase services is managed by Firebase CLI and wrapped in convenience NPM commands in root package.json: 
* `deploy:dashboard:(stage|prod)` – builds Dashboard app with Webpack and deploys it to configured Hosting in current Firebase project.
* `deploy:server:(stage|prod)` – Server (Functions, Firestore Rules and Indexes)
For more details examine those commands, they are basically combined from other more specific ones.

### Deploy mobile apps to Play Market and App Store

Expo covers all the deployment process in [their documentation](https://docs.expo.io/distribution/introduction/) (and [here](https://docs.expo.io/distribution/uploading-apps/) specifically), but the highlights are:
* Making Standalone builds is required only when some native features have changed, including bundled assets, app permissions or dynamic links configuration. Also, it is required when the Expo SDK or application version changes and when there’s a need to use another Expo account.
* Since currently the mobile project uses [Expo Managed Workflow](https://docs.expo.io/introduction/managed-vs-bare/#managed-workflow), for all other cases like updated JS code or most types of assets – OTA (over-the-air) flow will work via [Publishing](https://docs.expo.io/workflow/publishing/).
* Expo account is required for deploying/publishing via Expo. Standalone builds queue, apps published JS and assets are associated with this account. It is totally not a problem to deploy a new standalone build using another Expo account, but is required to make Publishing work later.

## External dependencies 

The following dependencies are organized as Git submodules:
* Maslo Persona – logic and animations for Maslo Persona orb.
* React Native Switch Pro – a package for rendering Switch in RN apps; in this fork the component was refactored to TypeScript with adaptations to the new React lifecycle.

## Analytics

1. The mobile apps use Firebase Analytics at a basic level (without logging events).
2. Dashboard uses Google Analytics with a custom library (`common/services/analytics`).

## Notifications

Mobile app uses Local and Push notifications. Most related types are defined in `common/models/Notifications.ts`. NotificationTypes enum defines the following types:

1. Retention – local notifications for reminding a user to make a check-in. A user can adjust them in Settings.
2. CustomPrompt – push sent to a client for a scheduled prompt. Latters are set in the Dashboard.
3. Assessment – push sent to a client when an assessment has been activated by a Coach in their Dashboard.
4. NewGoals – push sent to a client when a new goal has been added by a Coach.
5. TriggerPhrase – push sent to a client when Records analyzer has found ‘trigger phrase’ in their check-in.
6. NewDocumentLinkShared – push sent to a client when a document link has been shared with them by a Coach.


## Persona
![](https://cdn-images-1.medium.com/max/1600/1*Gm7A7w4vJZeNXKHJQxhq7Q.gif)

[Maslo Persona Orb](https://github.com/HeyMaslo/maslo-persona) is responsible for rendering Persona animations in WebGL context using shaders geometry and GSAP library. 
It also exposes 2 platform-dependant wrappers: 

1. for DOM – used in Dashboard, in Client’s Overview just as an interface element.
2. for Expo – used in Mobile; basically almost on every screen it takes a significant part of the user interface.

## Structure

### Common

Commons contain platform-independent code to be re-used in dashboard, mobile and server apps. It describes business logic models, DTOs, utils, helpers and even some Controllers and ViewModels.

#### services, helpers, utils

Services contain cross-platform wrappers for client-side Firebase, localization and analytics. Helpers was designed to contain re-usable business logic code, while utils should contain general utilities like math, strings, validation etc.

#### Models

Models are database entities or just data structures with some additional helper logic for manipulating objects. Also they define DTOs and Enums.

#### Repository Layer

Database repositories wrap all access to Firestore. It allows to specify an API for working with the DB, add some additional validations and make compound queries and transactions.

#### IntakeForms `common/models/intakeForms`

IntakeForms (aka Assessments) – feature for allowing Coach to collect some data from their Clients in form of questionnaires. Index.ts and types.ts define data structure types, types of assessments and types enabled by default. All other files are definitions for specific assessment types.

#### Prompts `common/models/prompts`

This folder contains models definitions for few connected features: 
  * Custom Prompts 
  * Intervention Tips
  * Goals
They are connected by sharing the same data structure their data stored in (PromptsLibrary and ClientLibraryState in `common/models/prompts/Prompt.ts`) and endpoint (IntakeFormsEndpoint in `common/abstractions/functions.ts`).


## Dashboard and Mobile

Dashboard and Mobile apps use the customized MVVM pattern with an additional layer of controllers. 

* Models. Describe data structures stored in DB and mediator entities; may contain some additional helper code.
* Controllers. Stateful components usually organized in hierarchy. Contain client side business logic (but disregard which frontend engine is used), synchronize with DB, make API calls and expose observable data to be read by ViewModels. This layer depends only on Models and API.
* ViewModels. Implements all logic for Views, but with no dependency on the View layer. Transforms data from Controllers, wraps actions and makes sure View knows what to show and what to do when a user interacts.
* Views. Responsible only for visualization of certain ViewModels, should present data as is, rarely do any kind of logic. Shouldn’t access Controllers or DB/APIs directly. 

### Routing and StateMachine

State Machine is a system that switches UI and Persona states according to a scenario.

Each state is a screen with some UI and interactive elements. Since the app has only one instance of Persona on the screen, its state is managed as well by each State. Persona should react to global operations (like ‘in progress’ state presented by ‘listen’ animation) as well as to actions within a state, being at the same time on the top of all UI. So every state can manage this via special context (IPersonaViewContext).

Scenario is a declarative data structure that defines transitions between States. There are ‘enter’ and ‘exit’ conditions for each State which are tied to the application state or user produced triggers. Conditions and triggers can be combined with logical ‘and’ or ‘or’ operations. Triggers are defined globally but can be processed locally on transition level. Conditions are based on observable getters so whenever the value of the getter changes the condition raises re-computing of transition so Scenario can decide to switch a State.

Main benefit of such an approach is flexibility. Each State can be transitioned to any other based on defined conditions for the application state. Application state mutates according to user flow, so the Scenario stays declarative, clean and basically defines the user flow. Also, Scenario can be easily tweaked according to app configuration like enabling/disabling some features.

1. Scenario is splitted to 3 parts:
  * Scenario Runner (`mobile/src/stateMachine/scenario.runner.tsx`) – runs a given scenario, takes care of mounting correct State, observing and computing conditions and triggers, making transitions.
  * Scenario itself (`mobile/src/stateMachine/scenario.ts`) – app specific, declares transitions for each State.
  * Scenario ViewModel (`mobile/src/stateMachine/scenario.viewModel.ts`) – app specific, declares all necessary conditions for building transitions.
And director of this party is StateMachine (`mobile/src/stateMachine/machine.tsx`) which renders Scenario Runner configured with a particular scenario, Persona and connects them via an instance of IStateViewContext.


### Backend

Backend uses Firebase Functions, so it consists of a set of endpoints grouped together by logical APIs. All endpoints reference can be found in `common/abstractions/functions.ts.`

Every physical and logical endpoint is described via FunctionDefinition class (`common/abstractions/functions.definition.ts`) with all required meta including In/Out data structures definition. On the server side, it allows Firebase to make it up and running using FunctionFactory (`server/functions/src/utils/createFunction.ts`). On the client side, the another FunctionFactory (`common/services/firebase/FunctionFactory.ts`) allows clients to make typed promise-based requests to the endpoint using common function definition.

#### Cron jobs

There are 3 types of cron jobs (`server/functions/src/cron.ts`)
  * Scheduled Events – triggered every 5 minutes to process project events (like sending push notifications for specific events).
  * Export and Import DB – triggered every 24hrs for making a backup of the Firestore database and importing it into the BigQuery project.

#### Database

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

## Data Policy Regarding Mobile Companion Applications
Maslo's companion kit is an open source software stack that relies on differing technologies to supply user experiences, signal processing and data movement for users and administrators.

Maslo's approach to security and privacy is based on the idea that security and privacy is an ongoing process and not a state of technology.  We have implemented a variety of best practices and best technologies to provide ongoing improvements to secure and private services.

It may be of specific interest to know the following:
* Some data persists on the phone/device in the form of caches.  This cached data uses the default encryption of the host OS and device.
* All data in motion (going to and from APIs) is encrypted via the latest SSL technologies
* All data stored in the cloud (Google or Amazon, depending on partner) is encrypted in motion and at rest.
* All data access is logged on device and in cloud.  Only device users with specific accounts can access data on their device.  Only Maslo users with specifically approved credentials may access user or PII data.  Again, all access is logged and separation of concern is managed (data scientists do not get access to PII, developer do not use production data etc).  All access must be approved by legal or CEO.

Maslo users the following technologies which may be referenced for their own security and privacy details:
* Expo and React Native for Mobile Application source code - https://docs.expo.io/regulatory-compliance/data-and-privacy-protection/ and https://reactnative.dev/docs/security
* Google Cloud and Amazon AWS https://cloud.google.com/security and https://aws.amazon.com/compliance/data-privacy-faq/

Interested parties may want more info on Maslo Privacy and Security:
https://github.com/HeyMaslo/data-privacy
https://maslo.kb.help/5-data-privacy/
