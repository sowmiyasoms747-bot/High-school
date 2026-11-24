# Learning Universe LMS – High School (Classes 9–10)

Student app built from `Learning Universe LMS UI Flow.png`. React 18, TypeScript, Vite.

    npm install
    npm run dev       # http://localhost:5173
    npm run build     # type-check and build to dist/

## Demo logins (password `student123`)

| Class | Student ID | Student |
| --- | --- | --- |
| 10 | LU10-045 | Kavin R. |
| 9 | LU09-032 | Meera S. |

## Where things are

| Path | What it holds |
| --- | --- |
| `src/pages` | One file per section of the app |
| `src/components` | Layout, shared UI and SVG artwork |
| `src/styles.css` | All styling; colours are at the top |
| `src/data/subjects.ts` | Subjects and chapter lists per class |
| `src/data/lessons.ts` | Theory, practice and test content per chapter |
| `src/data/students.ts` | Demo accounts and their progress |
| `src/state.tsx` | Progress rules and saving |
| `src/buddy.ts` | AI Study Buddy answers |

## Screen sizes

All responsive rules are at the end of `src/styles.css`.

| Screen | Navigation |
| --- | --- |
| Phone (up to 720px) | Bottom tab bar and slide-out menu |
| Landscape phone (height up to 500px) | Slim header and slide-out menu |
| Tablet (721–1100px) | Icon rail |
| Laptop and desktop (1101px and up) | Full sidebar |
| Large monitor (1700px and up) | Full sidebar, interface scaled up to 2.4× |

## Before going live

- **Login and data:** replace `STUDENTS`, `SEEDS` and the `localStorage` calls in `state.tsx` with your API. Test answers ship to the browser today, so scoring must move to the server.
- **Live classes:** place the meeting provider inside `.stage` in `pages/Live.tsx`.
- **Video:** set `videoUrl` on a lesson to play a real video instead of the animated lesson.
- **AI Study Buddy:** replace `askBuddy` with a call to your AI service.
- **Assignments:** attached files are recorded by name only; nothing is uploaded.
