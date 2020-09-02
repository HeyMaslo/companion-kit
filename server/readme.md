
# Everee backend

## App cloning

1. Ensure project configuration in `server/functions/src/services/config/index.ts` is set up properly.
2. Ensure all necessary variables are set. Run `firebase -P (production | staging) functions:config:(get|set)` to get or set variables. They should look like this:

```json
{
  "envs": {
    "devlogin": "true", // To allow demo account log in
    "sendgrid_api_key": "...",
    "is_prod": "true", // set false for staging
    // in case Twilio is used
    "twilio_phone_number_from": "...",
    "twilio_account_sid": "...",
    "twilio_auth_token": "..."
  }
}
```

3. Deploy backend before running apps: `yarn deploy:(stage|prod)`

## Structure

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

### API

API is exposed via Firebase Cloud Functions. Function can be an API endpoint, Scheduler listener or PubSub listener.

Each endpoint might handle few types of requests to make amount of Functions deployed as less as possible. These requests types are group into endpoints by features, logic and services.

Every request type for every endpoint in the system has clear and [straightforward declaration](../common/abstractions/functions.ts), grouped by namespaces. A declaration allows all calls to be consistent across platforms.
