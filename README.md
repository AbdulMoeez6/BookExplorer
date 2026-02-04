# Book Explorer App - React Native Case Study

Hi there, here is my submission for the Book Explorer app case study. I built this using React Native (Expo) and Typescript as requested.

## Tech Stack Used
- React Native with Expo 
- TypeScript 
- Axios for api requests
- React Navigation 
- Jest for testing

## How I Built This 

I wanted to share some decisions i made during development because things didnt go exactly as planned initially.

**1. The API Switch**
At first i thought about using Google Books API because its easy. But while testing, i kept hitting "429 Too Many Requests" errors just by searching a few times. Since the requirements mentioned Open Library , I decided to switch to **Open Library API** completely. It is free and doesnt need an API key, which makes it easier for you to test without setup.

**2. Solving the "Missing Author" Problem**
One big issue i found with Open Library is that it gives good book details but sometimes the Author Biography is empty (even for famous authors like James Clear).
I didn't want the app to look broken, so I wrote a custom service that does a "fallback".
- First, it tries to get the bio from Open Library.
- If that fails, it silently checks **Wikipedia's Summary API** in the background.
- If both fail, it shows a polite default message.
Now if you search "Fifty Shades of Grey", you actually get E.L. James bio instead of a blank screen.

**3. Search Improvements**
Initially the search was only working for book titles. I realized users might search for authors too. I updated the API query from `title=` to `q=` so now you can search for "Atomic Habits" or "James Clear" and both works.

## How to Run the App

You can run this easily on your local system.

1. **Clone or Download** this repository.
2. Open the terminal in the project folder.
3. Install the dependencies:
   ```bash
   npm install
4. Start the server:

Bash
npx expo start
Press a to run on Android Emulator or scan the QR code with your phone.

5. Testing
I added unit tests for the main UI component (BookCard). You can run them by typing:

Bash
npm test