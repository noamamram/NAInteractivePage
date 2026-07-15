export const translations = {
    en: {
        nav: {
            home: "Home",
            about: "About",
            experience: "Experience",
            projects: "Projects",
            contact: "Contact",
            arcade: "Arcade",
            audioOn: "◉ AUDIO_ON",
            audioOff: "◌ AUDIO_OFF",
            homeAria: "NA Interactive — Home",
        },
        lang: {
            en: "EN",
            he: "עב",
            switchAria: "Switch language",
        },
        hero: {
            sysInit: "[ SYS_INIT // CONNECTION_ESTABLISHED ]",
            tags: ["Unity Development - Games & simulations", "XR & VR", "Design", "3D Development"],
            scroll: "↓ SCROLL_TO_CONTINUE ↓",
        },
        about: {
            title: "ABOUT",
            subtitle: "// OPERATOR_DOSSIER",
            identityDat: "◉ IDENTITY.dat",
            bioTxt: "// BIO.txt",
            fields: {
                NAME: "NOAM AMRAM",
                STUDIO: "NA INTERACTIVE",
                ROLE: "Unity Dev & XR Lead",
                BASED: "MODIIN, IL",
                YEARS: "SINCE_2021",
                STATUS: "OPEN_TO_WORK",
            },
            fieldKeys: {
                NAME: "NAME",
                STUDIO: "STUDIO",
                ROLE: "ROLE",
                BASED: "BASED",
                YEARS: "YEARS",
                STATUS: "STATUS",
            },
            bio1:
                "Unity developer specializing in XR/VR — designing and building interactive systems with AI integration, C#, and solid code architecture. Former Simulation Development Team Lead in the IDF Intelligence Corps, with full end-to-end ownership: requirements, architecture, development, and deployment.",
            bio2:
                "Currently Unity Developer & XR Lead at Plectrum LTD. Building a Unity SDK for communication with various wearable haptic products, VR demo experiences, and a control app to operate the line. I match solutions to problems and spec products when needed. Hebrew — native. English — fluent.",
        },
        experience: {
            title: "EXPERIENCE",
            subtitle: "// FIELD_DEPLOYMENTS",
            view: "[ VIEW ↗ ]",
            holoProjector: "◉ HOLO_PROJECTOR",
            live: "● LIVE",
            standby: "○ STANDBY",
            awaitingTarget: "AWAITING_TARGET",
            hoverHint: "Hover a project to project a 3D asset preview into this chamber.",
            tapToInspect: "TAP_TO_INSPECT",
        },
        works: {
            title: "PROJECTS",
            subtitle: "// WORK_PORTFOLIO",
            open: "[ OPEN ↗ ]",
            back: "← BACK_TO_PORTFOLIO",
            noMedia: "NO_MEDIA",
            mediaSlot: "MEDIA_SLOT",
            platform: "PLATFORM",
            stack: "// STACK",
            github: "⎇ GITHUB ↗",
        },
        worksList: [
            {
                id: "classified-vr-sim",
                title: "Classified VR Training Simulator",
                platform: "VR",
                summary:
                    "Classified VR simulator for combatant training — fielded across IDF training pipelines, with 20,000+ soldiers trained. Selected Outstanding Project by the Head of Military Intelligence.",
                body:
                    "Large-scale immersive training built for operational readiness. Delivered as part of the Intelligence Corps simulation array: end-to-end ownership from requirements and architecture through Unity VR implementation and classroom deployment. Became part of how combatants are prepared — recognized as an Outstanding Project by the Head of Aman (Military Intelligence).",
                stack: ["Unity", "C#", "VR", "Training Systems", "OpenXR", "Architecture", "Deployment"],
                media: [],
            },
            {
                id: "aptic-feedback",
                title: "Aaptic Feedback",
                platform: "VR",
                summary:
                    "Plectrum VR demo — a dark-forest ranger survival game where wearable haptics tell you where threats are when vision fails.",
                body:
                    "You play a forest ranger in near-total darkness. Monkeys close in and throw branches, mushrooms, and other objects. With the Plectrum haptic shirt you feel the vibration first — darkness narrows sight, so touch becomes the primary cue for where to look. Once you spot a monkey, grab a banana from the crate and throw it; the monkey eats and leaves. Stay longer and more monkeys arrive, throwing faster and harder, until you fall. Survive as long as you can. Built on the custom Unity haptics SDK I developed for Plectrum.",
                stack: ["Unity", "C#", "OpenXR", "Meta Quest", "Haptics SDK", "BLE", "XR ITK"],
                github: "https://github.com/noamamram/Aptic-Feedback",
                media: [],
            },
            {
                id: "plectrum-player",
                title: "Plectrum Player",
                platform: "Android / PC",
                summary:
                    "Control app and product SDK for Plectrum haptics — BLE device selection, 3D product preview, and vibration control with full SDK parameters.",
                body:
                    "I built a custom SDK that owns the software–hardware link (BLE pairing and device messaging), then shipped Plectrum Player on top of it for Android and desktop. Operators pick a product (BLE discovery under the hood), inspect a 3D representation of the device, and drive vibration with the same parameter surface the SDK exposes — intensity, patterns, and product-specific channels — without rewriting transport code per app.",
                stack: ["Unity", "C#", "SDK Design", "BLE", "Android", "Windows", "3D UI"],
                github: "https://github.com/noamamram/PlectrumPlayer",
                media: [],
            },
            {
                id: "vr-firing-ranges",
                title: "VR Firing Ranges",
                platform: "VR",
                summary:
                    "VR shooting ranges with weapon handling, magazine/stoppage drills, and live target engagement for combatant training.",
                body:
                    "Immersive range environments focused on procedural weapon use: draw, reload, clear stoppages, and engage targets under time pressure. Built to reinforce muscle memory and decision-making inside controlled VR scenarios used in military training pipelines.",
                stack: ["Unity", "C#", "VR", "XR Interaction", "Weapon Systems", "Training Systems"],
                media: [],
            },
            {
                id: "iron-word",
                title: "Iron Word",
                platform: "PC",
                summary:
                    "Touch-typing trainer framed as an Iron Dome defense game — missiles are letters; typing the right key fires an interceptor.",
                body:
                    "Educational PC game developed in military service to raise blind typing speed without looking at the keyboard. You defend as Iron Dome: waves of incoming missiles each map to a letter in the active language. Press the matching key to launch a missile and destroy it. Difficulty ramps with more missiles and faster typing — supporting multiple languages for progressive drills.",
                stack: ["Unity", "C#", "Educational Games", "Localization", "UI", "Game Design"],
                media: [],
            },
            {
                id: "word-detective",
                title: "Word Detective",
                platform: "PC / Android",
                summary:
                    "3D English-learning adventure with AI NPCs — a museum heist mystery driven by spoken and written dialogue adapted to your level.",
                body:
                    "Built for a previous company as a 3D game for PC and Android. You play a detective investigating a museum theft in the United States. Characters are powered by AI through a server I wrote that talks to the Claude API. The first character assesses your English level; the rest ask story-driven questions at that level. Correct answers unlock clues and push the investigation forward. Interaction works in both speech and text.",
                stack: ["Unity", "C#", "Android", "AI / LLM", "Claude API", "Speech", "Educational Games"],
                media: [],
            },
            {
                id: "space-cactus",
                title: "Space Cactus",
                platform: "VR",
                summary:
                    "Home-assignment VR simulation — keep a cactus alive in space by managing temperature across day/night light cycles.",
                body:
                    "A Unity VR technical assignment built around clean architecture and gameplay systems. Your job is to keep the cactus alive aboard a spacecraft: control the cabin window across day and night cycles (light and dark in space) to regulate temperature. Passed as a Unity Developer home assignment.",
                stack: ["Unity", "C#", "VR", "Clean Architecture", "Gameplay Systems"],
                github: "https://github.com/noamamram/SpaceCactus",
                media: [],
            },
            {
                id: "procedural-water",
                title: "Procedural Water Surface",
                platform: "PC",
                summary:
                    "Real-time interactive 3D water waves — procedural mesh generation with physics-based deformation and tunable parameters.",
                body:
                    "Desktop simulation home assignment: generate a procedural 3D water surface that reacts interactively, driven by a custom C# math/mesh DLL and wave deformation. Operators can adjust simulation parameters live. Passed as a Unity Developer technical assignment.",
                stack: ["Unity", "C#", "Procedural Mesh", "Native DLL", "Shaders", "Physics"],
                github: "https://github.com/noamamram/ProceduralWaterSurface",
                media: [],
            },
            {
                id: "waddle-in-2d",
                title: "WaddleIn 2D",
                platform: "PC",
                summary:
                    "2D Unity platformer — play a penguin, grab the key, reach the igloo. Every run builds a new level from rule-based procedural generation.",
                body:
                    "Home assignment completed in under a week for a Unity Developer role. Collect the key, avoid enemies, and reach the igloo. Levels are generated automatically from defined rules so each run is unique — effectively endless stages. Assignment successfully completed.",
                stack: ["Unity", "C#", "2D", "Procedural Generation", "Platformer"],
                github: "https://github.com/noamamram/WaddleIn2D",
                media: [],
            },
        ],
        projects: [
            {
                id: "plectrum",
                org: "Plectrum LTD",
                role: "Unity Developer & XR Lead",
                year: "2025 — Present",
                summary:
                    "Leading Unity and XR at a wearable-haptics startup. Built a custom Unity SDK (BLE, TCP, Serial) connecting apps to multiple haptic products — vests, bands, and more. High-performance Meta Quest VR demos with OpenXR and XR Interaction Toolkit. Performance optimization, a control app for adaptive scenarios, and LLM integration.",
                stack: [
                    "Unity",
                    "C#",
                    "OpenXR",
                    "XR ITK",
                    "SDK Design",
                    "BLE",
                    "TCP",
                    "Serial",
                    "LLM",
                    "VR Performance",
                    "Product Design",
                    "Meta Quest",
                ],
                kind: "shirt",
            },
            {
                id: "idf-sim",
                org: "IDF Intelligence Corps",
                role: "Game & Simulations Team Leader",
                year: "2023 — 2025",
                summary:
                    "Led 10 Unity developers and 3D artists on classified VR and PC training simulators. Owned requirements, architecture, development, and deployment end to end. Hands-on delivery on dozens of projects, including a large-scale VR simulator that trained 15,000+ soldiers in its first year. Outstanding Project award (Head of Intelligence Corps) and Outstanding Soldier in the Training Array.",
                stack: [
                    "Unity",
                    "C#",
                    "VR",
                    "Architecture",
                    "Requirements",
                    "Git",
                    "Performance",
                    "Deployment",
                    "Team Leadership",
                    "Hands-on Dev",
                    "Training Systems",
                ],
                kind: "vr",
            },
            {
                id: "idf-lt",
                org: "IDF Military Colleges",
                role: "Learning Technology Team Leader",
                year: "2021 — 2023",
                summary:
                    "Led a 10-person learning technology team building advanced, tailor-made training solutions for senior IDF officers — scoping problems and designing products to match each need. VBS Tactical Simulator integration, operations, and scenario development. Certificate of Excellence from an IDF Major General.",
                stack: [
                    "Unity",
                    "VBS",
                    "Scenario Design",
                    "Training Systems",
                    "Custom Solutions",
                    "Team Leadership",
                    "Requirements",
                    "Integration",
                ],
                kind: "rifle",
            },
        ],
        modal: {
            stack: "// STACK",
        },
        skills: {
            header: "// SKILLSET.array[ ]",
            engage: "⚡ ENGAGE_PHYSICS_ENGINE",
            engageHint: "▸ CLICK TO ACTIVATE",
            disengage: "◌ DISENGAGE",
            gravityDesktop: "▼ GRAVITY: 9.8 | DRAG: ENABLED | CLICK + TOSS",
            gravityMobile: "▼ GRAVITY: 9.8 | DRAG: ENABLED | TOUCH + TOSS",
            items: [
                "Unity",
                "Games & Sims",
                "C#",
                "VR / XR",
                "3D Development",
                "OpenXR",
                "SDK Design",
                "AI / LLM",
                "Architecture",
                "Product Design",
                "Problem Solving",
                "BLE / TCP",
                "Performance",
                "Git",
                "Blender",
                "Python",
                "VBS",
                "Leadership",
            ],
        },
        contact: {
            title: "CONTACT",
            subtitle: "// OPEN_A_CHANNEL",
            subjectActive: "◉ SUBJECT_ACTIVE",
            aimLock: "AIM_LOCK",
            eyeTrack: "EYE_TRACK: ON",
            active: "◉ ACTIVE",
            channelsList: "// CHANNELS.list",
            desc: "Hover an entry — the operator will point you to the right channel. Pick whichever you prefer.",
            responseInfo: "ⓘ AVG_RESPONSE_TIME: 4_HOURS // TIMEZONE: GMT+3 // PREF: WHATSAPP",
            links: {
                whatsapp: "WHATSAPP",
                linkedin: "LINKEDIN",
                email: "EMAIL",
                phone: "PHONE",
                github: "GITHUB",
            },
        },
        arcade: {
            title: "ARCADE",
            subtitle: "// SIDE_QUEST.exe",
            incoming: "░░░ INCOMING_TRANSMISSION ░░░",
            breach: "!! BREACH_DETECTED !!",
            score: "SCORE",
            time: "TIME",
            combo: "COMBO",
            gameOver: "GAME_OVER",
            final: "FINAL",
            playAgain: "▶ PLAY_AGAIN",
            fire: "▲ FIRE",
            controlsDesktop: "← → MOVE  •  SPACE SHOOT  •  60 SECONDS",
            controlsMobile: "TAP CONTROLS BELOW  •  60 SECONDS",
            controlsMobileLong: "TAP CONTROLS  •  60 SECONDS  •  AVOID THE SPIRES",
        },
        footer: {
            tagline: "immersive solutions & development",
            endTransmission: "END_OF_TRANSMISSION",
            copyright: "© 2026 NOAM_AMRAM // NA_INTERACTIVE",
            builtWith: "BUILT_WITH_THREE.JS + REACT",
        },
    },
    he: {
        nav: {
            home: "בית",
            about: "אודות",
            experience: "ניסיון",
            projects: "פרויקטים",
            contact: "צור קשר",
            arcade: "ארקייד",
            audioOn: "◉ שמע_פועל",
            audioOff: "◌ שמע_כבוי",
            homeAria: "NA Interactive — דף הבית",
        },
        lang: {
            en: "EN",
            he: "עב",
            switchAria: "החלפת שפה",
        },
        hero: {
            sysInit: "[ אתחול_מערכת // חיבור_הוקם ]",
            tags: ["פיתוח Unity - משחקים וסימולציות", "XR & VR", "איפיון", "פיתוח תלת־ממד"],
            scroll: "↓ גלול_להמשך ↓",
        },
        about: {
            title: "אודות",
            subtitle: "// תיק_מפעיל",
            identityDat: "◉ זהות.dat",
            bioTxt: "// ביוגרפיה.txt",
            fields: {
                NAME: "נועם עמרם",
                STUDIO: "NA INTERACTIVE",
                ROLE: "Unity Dev & XR Lead",
                BASED: "מודיעין, ישראל",
                YEARS: "מאז_2021",
                STATUS: "פתוח_לעבודה",
            },
            fieldKeys: {
                NAME: "שם",
                STUDIO: "סטודיו",
                ROLE: "תפקיד",
                BASED: "מיקום",
                YEARS: "שנים",
                STATUS: "סטטוס",
            },
            bio1:
                "מפתח Unity המתמחה ב-XR/VR, באיפיון ופיתוח מערכות אינטרקטיביות — עם AI, C# וארכיטקטורת קוד. לשעבר ראש צוות פיתוח סימולטורים בחיל המודיעין, עם ניסיון end-to-end: אפיון, ארכיטקטורה, פיתוח והטמעה.",
            bio2:
                "כיום Unity Developer & XR Lead ב-Plectrum LTD. מפתח SDK ל-Unity לתקשורת עם מוצרי haptics מגוונים, משחקי דמו ב-VR ואפליקציית שליטה להפעלת המוצרים. מתאים פתרון לבעיה ומאפיין תוצרים לפי צורך. עברית — שפת אם, אנגלית — רמה גבוהה.",
        },
        experience: {
            title: "ניסיון",
            subtitle: "// פריסות_שטח",
            view: "[ צפייה ↗ ]",
            holoProjector: "◉ מקרן_הולוגרפי",
            live: "● חי",
            standby: "○ המתנה",
            awaitingTarget: "ממתין_ליעד",
            hoverHint: "רחף מעל פרויקט כדי להקרין תצוגת תלת-ממד בתוך התא.",
            tapToInspect: "הקש_לבדיקה",
        },
        works: {
            title: "פרויקטים",
            subtitle: "// תיק_עבודות",
            open: "[ פתיחה ↗ ]",
            back: "← חזרה_לתיק",
            noMedia: "אין_מדיה",
            mediaSlot: "מקום_למדיה",
            platform: "פלטפורמה",
            stack: "// מחסנית",
            github: "⎇ GITHUB ↗",
        },
        worksList: [
            {
                id: "classified-vr-sim",
                title: "סימולטור VR מסווג",
                platform: "VR",
                summary:
                    "סימולטור VR מסווג להכשרת לוחמים — הוטמע במערכי הכשרה בצה״ל, עם יותר מ־20,000 לוחמים שעברו בו. נבחר לפרויקט מצטיין של ראש אמ״ן.",
                body:
                    "אימון אימרסיבי בקנה מידה גדול למוכנות מבצעית. נמסר כחלק ממערך הסימולציות בחיל המודיעין: אחריות end-to-end מאפיון וארכיטקטורה דרך מימוש Unity VR ועד הטמעה בכיתות. הפך לחלק מהכשרת הלוחמים — ונבחר כפרויקט מצטיין של ראש אמ״ן.",
                stack: ["Unity", "C#", "VR", "Training Systems", "OpenXR", "Architecture", "Deployment"],
                media: [],
            },
            {
                id: "aptic-feedback",
                title: "Aaptic Feedback",
                platform: "VR",
                summary:
                    "משחק דמו של Plectrum ב־VR — שומר יערות ביער חשוך, כש־haptics לביש מראים איפה האיום כשהראייה נכשלת.",
                body:
                    "משחקים שומר יערות בחושך כמעט מוחלט. קופים מתקרבים וזורקים ענפים, פטריות וחפצים. עם חולצת ה־haptics של Plectrum מרגישים את הרטט קודם — החושך מצמצם את הראייה, וכך מתמקדים בתחושת המגע כדי לדעת לאן להסתכל. אחרי שראינו את הקוף לוקחים בננה מהארגז וזורקים; הקוף אוכל ועוזב. ככל שנשארים יותר מזמן מגיעים עוד קופים וזורקים יותר חזק, עד הפסד. המטרה: לשרוד כמה שיותר. מבוסס על ה־SDK שפיתחתי ל־Plectrum.",
                stack: ["Unity", "C#", "OpenXR", "Meta Quest", "Haptics SDK", "BLE", "XR ITK"],
                github: "https://github.com/noamamram/Aptic-Feedback",
                media: [],
            },
            {
                id: "plectrum-player",
                title: "Plectrum Player",
                platform: "Android / PC",
                summary:
                    "אפליקציית שליטה ו־SDK למוצרי haptics של Plectrum — בחירת מוצר ב־BLE, תצוגה תלת־ממדית והפעלת רטט עם פרמטרי ה־SDK.",
                body:
                    "בניתי SDK שמנהל את התקשורת בין תוכנה לחומרה (זיווג BLE והודעות מכשיר), ואז את Plectrum Player מעליו — לאנדרואיד ולמחשב. בוחרים מוצר (גילוי BLE מאחורי הקלעים), רואים ייצוג תלת־ממדי, ומפעילים רטט עם אותם פרמטרים שה־SDK חושף — עוצמה, דפוסים וערוצים לפי מוצר — בלי לכתוב שכבת תעבורה מחדש לכל אפליקציה.",
                stack: ["Unity", "C#", "SDK Design", "BLE", "Android", "Windows", "3D UI"],
                github: "https://github.com/noamamram/PlectrumPlayer",
                media: [],
            },
            {
                id: "vr-firing-ranges",
                title: "מטווחים ב־VR",
                platform: "VR",
                summary:
                    "מטווחים ב־VR עם תפעול נשק, טיפול במעצורים וירי למטרות — לאימון לוחמים.",
                body:
                    "סביבות מטווח אימרסיביות עם דגש על תפעול נשק: שליפה, טעינה, ניקוי מעצורים וירי למטרות תחת לחץ זמן. נבנה לחיזוק זיכרון שריר וקבלת החלטות בתוך תרחישי VR מבוקרים במערכי הכשרה.",
                stack: ["Unity", "C#", "VR", "XR Interaction", "Weapon Systems", "Training Systems"],
                media: [],
            },
            {
                id: "iron-word",
                title: "Iron Word",
                platform: "PC",
                summary:
                    "משחק לימוד הקלדה עיוורת במסגרת כיפת ברזל — כל טיל הוא אות; לחיצה על המקש הנכון מיירטת אותו.",
                body:
                    "משחק מחשב לימודי שפיתחתי בצבא לשיפור מהירות הקלדה בלי להסתכל על המקלדת. משחקים כיפת ברזל: גלים של טילים שכל אחד ממופה לאות בשפה הרלוונטית. לחיצה על האות שולחת מיירט ומפוצצת את הטיל. ככל שהמשחק מתקדם יש יותר טילים וצריך להקליד מהר יותר — עם תמיכה בשפות שונות.",
                stack: ["Unity", "C#", "Educational Games", "Localization", "UI", "Game Design"],
                media: [],
            },
            {
                id: "word-detective",
                title: "בלש המילים",
                platform: "PC / Android",
                summary:
                    "משחק תלת־ממד ללימוד אנגלית עם דמויות AI — חקירת גניבה ממוזיאון, עם דיבור וכתב שמתאימים לרמה שלך.",
                body:
                    "משחק שעשיתי לחברה קודמת — תלת־ממד למחשב ולאנדרואיד. משחקים בלש שחוקר גניבה ממוזיאון בארה״ב. הדמויות הן AI: שרת שכתבתי מתקשר עם ה־API של Claude. הדמות הראשונה בוחנת את רמת האנגלית; שאר הדמויות שואלות שאלות באנגלית לפי הרמה ולפי העלילה. תשובות נכונות נותנות רמז ומקדמות את החקירה — בדיבור ובכתב.",
                stack: ["Unity", "C#", "Android", "AI / LLM", "Claude API", "Speech", "Educational Games"],
                media: [],
            },
            {
                id: "space-cactus",
                title: "Space Cactus",
                platform: "VR",
                summary:
                    "מבחן בית ב־VR — לשמור על קקטוס בחיים בחלל באמצעות שליטה בטמפרטורה דרך חלון החללית במחזורי יום־לילה.",
                body:
                    "סימולציית Unity VR כמבחן בית למשרת Unity Developer, עם דגש על ארכיטקטורה נקייה ומערכות משחק. המטרה: לשמור על הקקטוס בחיים בחללית — לשלוט בחלון החללית במחזורי יום ולילה (אור וחושך בחלל) כדי לווסת טמפרטורה. עברתי את המבחן.",
                stack: ["Unity", "C#", "VR", "Clean Architecture", "Gameplay Systems"],
                github: "https://github.com/noamamram/SpaceCactus",
                media: [],
            },
            {
                id: "procedural-water",
                title: "Procedural Water Surface",
                platform: "PC",
                summary:
                    "סימולציית גלי מים תלת־ממדיים בזמן אמת — mesh פרוצדורלי עם עיוות פיזיקלי ושליטה בפרמטרים.",
                body:
                    "מבחן בית למחשב: יצירת משטח מים תלת־ממדי פרוצדורלי שמגיב באינטראקטיביות, מונע על ידי DLL מותאם ב־C# ליצירת mesh וגלים. ניתן לכוון פרמטרים בזמן אמת. עברתי את המבחן.",
                stack: ["Unity", "C#", "Procedural Mesh", "Native DLL", "Shaders", "Physics"],
                github: "https://github.com/noamamram/ProceduralWaterSurface",
                media: [],
            },
            {
                id: "waddle-in-2d",
                title: "WaddleIn 2D",
                platform: "PC",
                summary:
                    "משחק פלטפורמה דו־ממדי — פינגווין שצריך לקחת מפתח ולהגיע לאיגלו. כל שלב נוצר אוטומטית לפי חוקים.",
                body:
                    "מבחן בית למשרת Unity שפותח בפחות משבוע. אוספים מפתח, נמנעים מאויבים ומגיעים לאיגלו. השלבים נוצרים אוטומטית לפי חוקים שהוגדרו — למעשה אין־סוף שלבים. המשימה הושלמה בהצלחה.",
                stack: ["Unity", "C#", "2D", "Procedural Generation", "Platformer"],
                github: "https://github.com/noamamram/WaddleIn2D",
                media: [],
            },
        ],
        projects: [
            {
                id: "plectrum",
                org: "Plectrum LTD",
                role: "Unity Developer & XR Lead",
                year: "2025 — היום",
                summary:
                    "מוביל פיתוח Unity ו-XR בסטארטאפ haptics לביש. פיתוח Unity SDK מותאם (BLE, TCP, Serial) לחיבור אפליקציות למגוון מוצרי haptics — אפוד, רצועות ועוד. דמו VR ביצועים גבוהים ל-Meta Quest עם OpenXR ו-XR Interaction Toolkit. אופטימיזציית ביצועים, אפליקציית שליטה לתרחישים אדפטיביים ואינטגרציה עם LLM.",
                stack: [
                    "Unity",
                    "C#",
                    "OpenXR",
                    "XR ITK",
                    "SDK Design",
                    "BLE",
                    "TCP",
                    "Serial",
                    "LLM",
                    "VR Performance",
                    "Product Design",
                    "Meta Quest",
                ],
                kind: "shirt",
            },
            {
                id: "idf-sim",
                org: "חיל המודיעין",
                role: "Game & Simulations Team Leader",
                year: "2023 — 2025",
                summary:
                    "ניהול 10 מפתחי Unity ו-3D artists בסימולציות VR ו-PC מסווגות. אחריות מלאה על אפיון, ארכיטקטורה, פיתוח והטמעה. פיתוח אישי (hands-on) של עשרות פרויקטים, כולל סימולטור VR שהכשיר 15,000+ חיילים בשנה הראשונה. פרויקט מצטיין (ראש חיל המודיעין) וחייל מצטיין במערך ההדרכה.",
                stack: [
                    "Unity",
                    "C#",
                    "VR",
                    "Architecture",
                    "Requirements",
                    "Git",
                    "Performance",
                    "Deployment",
                    "Team Leadership",
                    "Hands-on Dev",
                    "Training Systems",
                ],
                kind: "vr",
            },
            {
                id: "idf-lt",
                org: "המכללות הצבאיות",
                role: "Learning Technology Team Leader",
                year: "2021 — 2023",
                summary:
                    "ניהול צוות של 10 אנשים בפיתוח פתרונות הדרכה מתקדמים ומותאמים אישית לקצינים בכירים — איפיון צרכים ותוצרים לפי צורך. אינטגרציה, תפעול ופיתוח תרחישים ל-VBS Tactical Simulator. תעודת הצטיינות מאלוף בצה״ל.",
                stack: [
                    "Unity",
                    "VBS",
                    "Scenario Design",
                    "Training Systems",
                    "Custom Solutions",
                    "Team Leadership",
                    "Requirements",
                    "Integration",
                ],
                kind: "rifle",
            },
        ],
        modal: {
            stack: "// מחסנית",
        },
        skills: {
            header: "// מערך_מיומנויות[ ]",
            engage: "⚡ הפעל_מנוע_פיזיקה",
            engageHint: "▸ לחץ להפעלה",
            disengage: "◌ כבה",
            gravityDesktop: "▼ כבידה: 9.8 | גרירה: פעילה | לחץ + זרוק",
            gravityMobile: "▼ כבידה: 9.8 | גרירה: פעילה | מגע + זריקה",
            items: [
                "Unity",
                "משחקים וסימולציות",
                "C#",
                "VR / XR",
                "פיתוח תלת־ממד",
                "OpenXR",
                "SDK Design",
                "AI / LLM",
                "Architecture",
                "Product Design",
                "Problem Solving",
                "BLE / TCP",
                "Performance",
                "Git",
                "Blender",
                "Python",
                "VBS",
                "Leadership",
            ],
        },
        contact: {
            title: "צור קשר",
            subtitle: "// פתיחת_ערוץ",
            subjectActive: "◉ נושא_פעיל",
            aimLock: "נעילת_מטרה",
            eyeTrack: "מעקב_עיניים: פעיל",
            active: "◉ פעיל",
            channelsList: "// רשימת_ערוצים",
            desc: "רחף מעל ערוץ — המפעיל יצביע על הדרך הנכונה. בחר/י את מה שנוח לך.",
            responseInfo: "ⓘ זמן_תגובה_ממוצע: 4 שעות // אזור_זמן: GMT+3 // מועדף: WHATSAPP",
            links: {
                whatsapp: "WHATSAPP",
                linkedin: "LINKEDIN",
                email: "אימייל",
                phone: "טלפון",
                github: "GITHUB",
            },
        },
        arcade: {
            title: "ארקייד",
            subtitle: "// משימת_צד.exe",
            incoming: "░░░ שידור_נכנס ░░░",
            breach: "!! זוהה_פריצה !!",
            score: "ניקוד",
            time: "זמן",
            combo: "קומבו",
            gameOver: "סוף_משחק",
            final: "סופי",
            playAgain: "▶ שחק_שוב",
            fire: "▲ ירי",
            controlsDesktop: "← → תנועה  •  רווח ירי  •  60 שניות",
            controlsMobile: "הקש על הכפתורים למטה  •  60 שניות",
            controlsMobileLong: "הקש על הכפתורים  •  60 שניות  •  הימנע ממגדלים",
        },
        footer: {
            tagline: "פתרונות אינטרקטיביים ופיתוח",
            endTransmission: "סוף_שידור",
            copyright: "© 2026 NOAM_AMRAM // NA_INTERACTIVE",
            builtWith: "נבנה_עם THREE.JS + REACT",
        },
    },
};

export function getProjects(lang) {
    return translations[lang]?.projects ?? translations.en.projects;
}

export function getWorks(lang) {
    return translations[lang]?.worksList ?? translations.en.worksList;
}

export function getSkills(lang) {
    return translations[lang]?.skills?.items ?? translations.en.skills.items;
}

export const CONTACT_LINK_HREFS = [
    {
        id: "whatsapp",
        handle: "052-591-5978",
        href: "https://wa.me/972525915978",
        icon: "✺",
        color: "#25D366",
    },
    {
        id: "linkedin",
        handle: "/in/noam-amram",
        href: "https://www.linkedin.com/in/noam-amram",
        icon: "in",
        color: "#0A66C2",
    },
    {
        id: "email",
        handle: "noamamram10@gmail.com",
        href: "mailto:noamamram10@gmail.com",
        icon: "✉",
        color: "#4fc3f7",
    },
    {
        id: "phone",
        handle: "052-591-5978",
        href: "tel:+972525915978",
        icon: "☎",
        color: "#ff6b35",
    },
    {
        id: "github",
        handle: "/noamamram",
        href: "https://github.com/noamamram",
        icon: "◈",
        color: "#e8edf5",
    },
];

export function getContactLinks(lang) {
    const labels = translations[lang]?.contact?.links ?? translations.en.contact.links;
    return CONTACT_LINK_HREFS.map((link) => ({
        ...link,
        label: labels[link.id] ?? link.id.toUpperCase(),
    }));
}
