# Shopfront

## What it is

Shopfront is a mobile shopping app built during the MERN Stack Mobile Hybrid Development bootcamp.
You can register and sign in, browse and search products, keep a cart, keep a shopping list with location tags, and set a profile photo.

## Architecture

- **App:** Expo SDK 57 and React Native 0.86 (this repository). Navigation with React Navigation, UI with React Native Paper, state with Redux Toolkit and redux-persist.
- **API:** Node and Express, deployed on Render. See the backend repository below.
- **Database:** MongoDB Atlas. Production uses its own database (`shopfront-prod`) and its own user with readWrite on that database only.
- **Updates:** builds listen to the `preview` channel on EAS Update, so JavaScript changes can ship without a new build.

The app can know where the API lives but never holds a secret: anything in an `EXPO_PUBLIC_` variable ends up inside the app file.

## Run it locally

1. Start the backend (`npm run dev` in the backend repository; its routes are listed in `ENDPOINTS.md`) and note its address.
2. Put the address in `.env` as `EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1`. For a phone on the same Wi-Fi use the computer's IP address in `.env.local`.
3. `npm install`, then `npx expo start`.
4. Run the tests with `npm test`.

Note: in production mode, `.env.local` overrides `.env.production`. Set `EXPO_PUBLIC_API_URL` in the shell when testing production mode.

## Deployment

- Backend repository: https://github.com/jetttijam-creator/mernstack
- Live API: https://shopfront-api-jett.onrender.com/api/v1 (health check at `/health`)
- Simulator build: `npx eas-cli build --platform ios --profile preview-simulator`
- Over-the-air update: `npx eas-cli update --channel preview --platform ios --environment preview --message "..."`
- Roll back an update: `npx eas-cli update:republish --group <id> --destination-branch preview`
- Release points are tagged `day7-m1` onwards in each repository.

## Demo

The demo script is in [DEMO.md](DEMO.md). It runs on the installed release-style build against the live API.

## Known limitations and next steps

Limitations:

- The free Render instance sleeps after about 15 minutes; the first request after that took about 23 seconds.
- The free instance's disk is temporary, so uploaded avatars are lost on every deploy.
- The Atlas M0 database has no cloud backups.
- Only iOS has been built and tested.

Next steps:

- Move uploads to cloud storage so they survive deploys.
- Move to a paid database tier with backups, and practise a restore.
- Use staged rollouts for over-the-air updates instead of publishing to everyone at once.
- Add real-time updates with Socket.io.
