# Getting Github env variables right!!!

1. Go to your github account.
2. Go to `Settings` (from the right top corner).
3. Go to `Developer Settings`.
4. Go to `OAuth Apps`
5. Click on `New OAuth App`
    - NOTE: This part is asking user for their github account restricted access.
    1. Give application name whatever you want your end user to see.
    2. Give the homepage url to the domain name or localhost:
    3. Give a description if you want your user to know something about this app.
    4. `important` Authorization callback URL: put the callback url here (you can get this from variable `GITHUB_CALLBACK_URL` in file `/backend/app/api/v1/endpoints/auth.py`) 
6. Click on Register application.
7. Copy the `Client ID` and `Client secrets` to env file.

### What did we just did
We need to access user's github info (public and hopefully private) to feed it to the ai model in the backend. And so now using this clint id and client secret github will ask user's to trust our app and send permitted info to our backend.


