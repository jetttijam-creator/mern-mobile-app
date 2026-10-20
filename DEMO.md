# Shopfront demo script (8 minutes)

Run this on the installed release-style build (EAS `preview-simulator`), not on Metro.
Call `https://shopfront-api-jett.onrender.com/health` a few minutes before starting so the free Render service is awake.
A cold start measured at about 23 seconds; a warm request takes under half a second.

1. (0:00) One sentence: Shopfront is a shopping app for people who want to browse products, keep a cart, and keep a shopping list that works even with a poor connection.
   Behind the screen: nothing yet, the app is on the sign-in screen.
2. (0:30) Open the installed app. Show the About screen: the live API address, the channel (`preview`) and the update ID.
   Behind the screen: the address was baked into the build by `eas.json`; the update ID comes from `expo-updates`.
3. (1:00) Register a new account and sign in.
   Behind the screen: a POST to the Render API, a password hashed with bcrypt, and a short-lived access token plus a refresh token kept in secure storage.
4. (1:45) Browse the products and open one.
   Behind the screen: ten products are read from the `shopfront-prod` database on MongoDB Atlas; images are requested at card size and cached by `expo-image`.
5. (2:30) Add two items to the cart. Show the badge.
   Behind the screen: the cart lives in Redux and never touches the server; only the changed row re-renders (memoised cards and cart rows).
6. (3:15) Use one native feature: open the shopping list and tag an item with my location (Simulator menu: Features, Location).
   Behind the screen: the app asks for permission with its own wording, reads the coordinates, and stores the tag on the phone.
7. (4:00) Close the app completely and reopen it. Still signed in.
   Behind the screen: the tokens are read back from secure storage and Redux state is restored by redux-persist.
8. (4:30) Architecture slide: app, Render API, Atlas. Trade-off: the free Render tier sleeps and has a temporary disk, so it is cheap but slow on first use and cannot keep uploads.
   Behind the screen: HTTPS ends at Render; Atlas only accepts Render's outbound addresses.
9. (6:30) What I would build next: cloud storage for uploads, a paid database tier with backups, staged OTA rollouts, real-time updates with Socket.io.
10. (7:30) Questions.

If something fails: say what happened in one sentence, then play the backup video at `~/Desktop/shopfront-demo/demo.mov` and carry on with the architecture slide.
If the first request hangs, say it is the free-tier cold start, wait for it, and use the time to explain why a paid instance would not sleep.
